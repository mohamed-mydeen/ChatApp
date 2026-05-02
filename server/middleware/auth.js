import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * protect — attach req.user or return 401.
 * Usage: router.get('/protected', protect, handler)
 */
export async function protect(req, res, next) {
  try {
    // 1. Extract token from Authorization header or cookie
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated. Token missing.' });
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Token is invalid or expired.' });
    }

    // 3. Ensure user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('[middleware/protect]', err);
    res.status(500).json({ success: false, message: 'Server error in auth middleware.' });
  }
}
