import User from '../models/User.js';

export async function getAllUsers(req, res) {
  try {
    // Return all users except the currently logged-in one
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('-password')
      .sort({ lastSeen: -1 });
    
    res.json({ success: true, users });
  } catch (err) {
    console.error('[userController]', err);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
}

// ── PATCH /api/users/profile ─────────────────────────────────────────────────
// Update the current user's profile (username, bio, phone, status, avatar, uniqueId)
export async function updateProfile(req, res) {
  try {
    const { username, bio, phone, status, avatar, uniqueId } = req.body;
    const user = req.user;

    // If username is being changed, check uniqueness
    if (username && username !== user.username) {
      const exists = await User.findOne({ username, _id: { $ne: user._id } });
      if (exists) return res.status(409).json({ success: false, message: 'Username is already taken.' });
      user.username = username;
    }

    // If uniqueId is being changed, check uniqueness
    if (uniqueId && uniqueId !== user.uniqueId) {
      const exists = await User.findOne({ uniqueId, _id: { $ne: user._id } });
      if (exists) return res.status(409).json({ success: false, message: 'This ID is already taken. Choose another.' });
      user.uniqueId = uniqueId.toUpperCase();
    }

    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (status !== undefined) user.status = status;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save({ validateBeforeSave: false });
    res.json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    console.error('[updateProfile]', err);
    res.status(500).json({ success: false, message: 'Server error updating profile.' });
  }
}

// ── GET /api/users/check-id?uniqueId=XXXX ────────────────────────────────────
// Check if a uniqueId is available (not taken by another user)
export async function checkUniqueId(req, res) {
  try {
    const { uniqueId } = req.query;
    if (!uniqueId || uniqueId.length < 4) {
      return res.json({ available: false, message: 'ID must be at least 4 characters.' });
    }
    const exists = await User.findOne({ uniqueId: uniqueId.toUpperCase(), _id: { $ne: req.user._id } });
    res.json({ available: !exists, message: exists ? 'This ID is already taken.' : 'ID is available!' });
  } catch (err) {
    res.status(500).json({ available: false, message: 'Server error.' });
  }
}
