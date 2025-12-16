import { Router } from 'express';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification,
  getUnreadCount 
} from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/notifications - Get user's notifications
router.get('/', getNotifications);

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', getUnreadCount);

// PUT /api/notifications/:notificationId/read - Mark specific notification as read
router.put('/:notificationId/read', markNotificationAsRead);

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put('/mark-all-read', markAllNotificationsAsRead);

// DELETE /api/notifications/:notificationId - Delete specific notification
router.delete('/:notificationId', deleteNotification);

export default router;
