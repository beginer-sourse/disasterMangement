import express from 'express';
import { getDashboardStats, getRealTimeStats } from '../controllers/dashboardController';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', getDashboardStats);

// Get real-time statistics
router.get('/realtime', getRealTimeStats);

export default router;
