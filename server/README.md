# Chat Server — Socket.IO Events Reference

## Connection Flow

```
Client                              Server
  │                                   │
  ├── connect ──────────────────────> │
  ├── register({ userId }) ─────────> │  joins personal room, marks online
  │ <── userOnline({ userId }) ────── │  broadcast to all
  │                                   │
```

## Events

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `register` | `{ userId: string }` | Register user identity after connecting |
| `sendMessage` | `{ id, senderId, receiverId, content, timestamp }` | Send a message to another user |
| `typing` | `{ senderId, receiverId }` | Signal typing started |
| `stopTyping` | `{ senderId, receiverId }` | Signal typing stopped |
| `markRead` | `{ senderId, receiverId }` | Mark all messages from `senderId` as read |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `receiveMessage` | `{ id, senderId, receiverId, content, timestamp, status }` | Delivered to the receiver's room |
| `messageSent` | Same as above | Echo back to sender confirming delivery |
| `userTyping` | `{ senderId }` | Receiver is told the sender is typing |
| `userStoppedTyping` | `{ senderId }` | Typing indicator cleared |
| `messagesRead` | `{ byUserId }` | Tells sender their messages were read |
| `userOnline` | `{ userId }` | Broadcast when a user connects |
| `userOffline` | `{ userId }` | Broadcast when a user disconnects |
| `error` | `{ message }` | Payload validation error |

## REST Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/health` | Server health + connected user count |
| `GET` | `/users/online` | List of currently online user IDs |
| `GET` | `/messages/:userA/:userB` | Full message history between two users |

## Client Usage Example (React)

```ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

// 1. Register after connecting
socket.on('connect', () => {
  socket.emit('register', { userId: 'alice' });
});

// 2. Send a message
socket.emit('sendMessage', {
  id: crypto.randomUUID(),
  senderId: 'alice',
  receiverId: 'bob',
  content: 'Hello Bob!',
  timestamp: new Date().toISOString(),
});

// 3. Listen for incoming messages
socket.on('receiveMessage', (message) => {
  console.log('New message:', message);
});

// 4. Typing indicators
socket.emit('typing', { senderId: 'alice', receiverId: 'bob' });
socket.on('userTyping', ({ senderId }) => console.log(`${senderId} is typing…`));
```
