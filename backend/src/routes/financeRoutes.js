import express from 'express';
import { getAccounts, createAccount, getCategories, createCategory, getTransactions, createTransaction, getBudgets, getActivities, logActivity, clearActivities, getDashboardStats } from '../controllers/financeController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
// activities endpoints: list, create generic log entry, and clear all for the user
router.get('/activities', protect, getActivities);
router.post('/activities', protect, logActivity);
router.delete('/activities', protect, clearActivities);
router.route('/accounts').get(protect, getAccounts).post(protect, createAccount);
router.route('/categories').get(protect, getCategories).post(protect, createCategory);

router.route('/transactions').get(protect, getTransactions).post(protect, createTransaction);
router.route('/budgets').get(protect, getBudgets);

export default router;
