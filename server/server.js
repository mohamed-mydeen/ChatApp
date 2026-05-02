import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import authRouter from './routes/auth.js';
import userRouter from './routes/users.js';
import { protect } from './middleware/auth.js';
import Message, { EXPIRY } from './models/Message.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// ─── MongoDB connection ───────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI ?? 'mongodb://localhost:27017/realtimechat')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// ─── App Setup ───────────────────────────────────────────────────────────────

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});


app.use(cors());
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

// ─── Production: Serve Frontend ───────────────────────────────────────────────
const distPath = path.resolve(__dirname, '../dist');
console.log(`[Server] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[Server] Serving static files from: ${distPath}`);

if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}


// ─── In-Memory Online Users (socket routing only) ────────────────────────────
// Messages are now persisted in MongoDB — only socket lookup stays in memory.
const onlineUsers = new Map(); // userId → socketId

// ─── REST: Health Check ───────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', connectedUsers: onlineUsers.size });
});

// ─── REST: Get online users ───────────────────────────────────────────────────

app.get('/users/online', (_req, res) => {
  res.json({ users: Array.from(onlineUsers.keys()) });
});

// ─── REST: Get message history (persisted) ───────────────────────────────────

app.get('/messages/:userA/:userB', protect, async (req, res) => {
  try {
    const { userA, userB } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: userA, receiverId: userB },
        { senderId: userB, receiverId: userA },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({ success: true, messages });
  } catch (err) {
    console.error('[/messages]', err);
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// ─── Socket.IO ───────────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[+] Socket connected: ${socket.id}`);

  // ── Event: register ──────────────────────────────────────────────────────
  // Client emits { userId } immediately after connecting to register their ID.
  socket.on('register', ({ userId }) => {
    if (!userId) return;

    onlineUsers.set(userId, socket.id);
    socket.data.userId = userId; // store on the socket for cleanup

    // Join a personal room so messages can be delivered by userId
    socket.join(userId);

    console.log(`[register] ${userId} → socket ${socket.id}`);

    // Notify everyone that this user is now online
    io.emit('userOnline', { userId });
  });

  // ── Event: sharePublicKey ─────────────────────────────────────────────────
  // Relay a user's public key to all OTHER connected sockets (for E2E key exchange)
  socket.on('sharePublicKey', ({ userId, publicKey }) => {
    console.log(`[E2E] relaying public key from ${userId}`);
    socket.broadcast.emit('peerPublicKey', { fromUserId: userId, publicKey });
  });

  // ── Event: sendMessage ───────────────────────────────────────────────────
  /**
   * Expected payload:
   * {
   *   id: string,        // unique message id (UUID generated client-side)
   *   senderId: string,
   *   receiverId: string,
   *   content: string,
   *   timestamp: string  // ISO string
   * }
   */
  socket.on('sendMessage', async (message) => {
    const { senderId, receiverId, content } = message;

    if (!senderId || !receiverId || !content) {
      socket.emit('error', { message: 'Invalid message payload.' });
      return;
    }

    try {
      const expiryMs = EXPIRY[message.expiry] ?? null;
      const expiresAt = expiryMs ? new Date(Date.now() + expiryMs) : null;
      // file is stored as JSON in the DB (base64 dataUrl + metadata)
      const file = message.file ?? null;

      const saved = await Message.create({ senderId, receiverId, content, status: 'delivered', expiresAt, file });

      const fullMessage = {
        id: saved._id.toString(),
        senderId,
        receiverId,
        content,
        file,
        timestamp: saved.createdAt.toISOString(),
        status: 'delivered',
      };

      console.log(`[sendMessage] ${senderId} → ${receiverId}: "${content || '[file]'}"`);

      io.to(receiverId).emit('receiveMessage', fullMessage);
      socket.emit('messageSent', fullMessage);
    } catch (err) {
      console.error('[sendMessage] DB error:', err.message);
      socket.emit('error', { message: 'Failed to save message.' });
    }
  });

  // ── Event: typing ────────────────────────────────────────────────────────
  // Emits a typing indicator to the conversation partner
  socket.on('typing', ({ senderId, receiverId }) => {
    io.to(receiverId).emit('userTyping', { senderId });
  });

  socket.on('stopTyping', ({ senderId, receiverId }) => {
    io.to(receiverId).emit('userStoppedTyping', { senderId });
  });

  // ── Event: markRead ──────────────────────────────────────────────────────
  // Client notifies server that messages up to this point have been read
  socket.on('markRead', ({ senderId, receiverId }) => {
    // Notify the original sender that their messages are now read
    io.to(senderId).emit('messagesRead', { byUserId: receiverId });
  });

  // ── Disconnect ───────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const userId = socket.data.userId;
    if (userId) {
      onlineUsers.delete(userId);
      io.emit('userOffline', { userId });
      console.log(`[-] ${userId} disconnected`);
    } else {
      console.log(`[-] Unknown socket disconnected: ${socket.id}`);
    }
  });
});

// ─── Start Server ────────────────────────────────────────────────────────────

const PORT = process.env.PORT ?? 4000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`   Socket.IO accepting connections from http://localhost:5173\n`);
});
