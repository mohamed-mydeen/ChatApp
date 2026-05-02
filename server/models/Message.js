import mongoose from 'mongoose';

// ── Expiry presets ─────────────────────────────────────────────────────────────
export const EXPIRY = {
  ONE_DAY:   1 * 24 * 60 * 60 * 1000,   // 86 400 000 ms
  SEVEN_DAYS: 7 * 24 * 60 * 60 * 1000,  // 604 800 000 ms
  NEVER: null,
};

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      trim: true,
      maxlength: [4096, 'Message is too long'],
      default: '',
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
    readAt: {
      type: Date,
      default: null,
    },
    // ── File attachment (base64 encoded, max ~10 MB) ──────────────────────────
    file: {
      name:    { type: String },
      type:    { type: String },   // MIME type
      size:    { type: Number },   // bytes
      dataUrl: { type: String },   // base64 data URL
    },
    // ── Auto-delete ──────────────────────────────────────────────────────────
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically
  }
);

// ── Compound index for fetching a conversation between two users efficiently ──
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, senderId: 1, createdAt: -1 });

// ── TTL Index ──────────────────────────────────────────────────────────────────
// MongoDB's background task checks every ~60 seconds and removes documents
// where expiresAt <= now.  Documents with expiresAt: null are NEVER deleted.
// expireAfterSeconds: 0 means "expire exactly at the expiresAt date".
messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

export default mongoose.model('Message', messageSchema);

