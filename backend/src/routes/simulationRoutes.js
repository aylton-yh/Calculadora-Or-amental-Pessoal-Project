import express from 'express';
import { getGoals, createGoal, createRatioSimulation } from '../controllers/simulationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/goals').get(protect, getGoals).post(protect, createGoal);
router.post('/ratios', protect, createRatioSimulation);

export default router;
