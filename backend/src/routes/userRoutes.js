import express from 'express';
import { registerUser, loginUser, getProfile, updateProfile, updatePreferences } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.route('/profile').get(protect, getProfile).put(protect, updateProfile);
router.put('/preferences', protect, updatePreferences);

export default router;
