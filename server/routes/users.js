import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getAllUsers, updateProfile, checkUniqueId } from '../controllers/userController.js';

const router = Router();

// Protect all user routes
router.use(protect);

router.get('/', getAllUsers);
router.patch('/profile', updateProfile);
router.get('/check-id', checkUniqueId);

export default router;
