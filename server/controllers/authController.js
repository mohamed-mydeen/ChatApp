import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ── Generate JWT ─────────────────────────────────────────────────────────────
function signToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  });
}

// ── Send token response ──────────────────────────────────────────────────────
function sendTokenResponse(user, statusCode, res) {
  const token = signToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: user.toSafeObject(),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Body: { username, email, password }
// ─────────────────────────────────────────────────────────────────────────────
export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Check for duplicates
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email.toLowerCase() ? 'Email' : 'Username';
      return res.status(409).json({ success: false, message: `${field} is already taken.` });
    }

    // Create user (password is hashed by the pre-save hook in the model)
    const user = await User.create({ username, email, password });

    console.log(`[auth] registered: ${user.username} (${user.email})`);
    sendTokenResponse(user, 201, res);
  } catch (err) {
    console.error('[auth/register]', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
// ─────────────────────────────────────────────────────────────────────────────
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Fetch user with password (it is excluded by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Mark online
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save({ validateBeforeSave: false });

    console.log(`[auth] logged in: ${user.username}`);
    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('[auth/login]', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me  (protected)
// ─────────────────────────────────────────────────────────────────────────────
export async function getMe(req, res) {
  res.json({ success: true, user: req.user.toSafeObject() });
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/logout  (protected)
// ─────────────────────────────────────────────────────────────────────────────
export async function logout(req, res) {
  req.user.isOnline = false;
  req.user.lastSeen = new Date();
  await req.user.save({ validateBeforeSave: false });
  res.json({ success: true, message: 'Logged out.' });
}
