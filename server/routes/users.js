import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getAllUsers } from '../controllers/userController.js';

const router = Router();

// Protect all user routes
router.use(protect);

router.get('/', getAllUsers);

export default router;
