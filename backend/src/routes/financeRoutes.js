import express from 'express';
import { getAccounts, createAccount, getCategories, createCategory, getTransactions, createTransaction, getBudgets, getActivities, getDashboardStats } from '../controllers/financeController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, getDashboardStats);
router.get('/activities', protect, getActivities);
router.route('/accounts').get(protect, getAccounts).post(protect, createAccount);
router.route('/categories').get(protect, getCategories).post(protect, createCategory);

router.route('/transactions').get(protect, getTransactions).post(protect, createTransaction);
router.route('/budgets').get(protect, getBudgets);

export default router;
