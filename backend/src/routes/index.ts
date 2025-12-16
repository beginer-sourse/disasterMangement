import { Router } from 'express';
import authRoutes from './auth';
import reportRoutes from './reports';
import commentRoutes from './comments';
import analyticsRoutes from './analytics';
import adminRoutes from './admin';
import dashboardRoutes from './dashboard';
import publicRoutes from './public';
import notificationRoutes from './notifications';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/reports', reportRoutes);
router.use('/comments', commentRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/public', publicRoutes);
router.use('/notifications', notificationRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Jalsaathi API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
