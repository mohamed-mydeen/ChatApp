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
