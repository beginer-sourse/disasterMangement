import { Router } from 'express';
import { 
  getAnalytics, 
  getReportsBySeverity, 
  getReportsByLocation, 
  getUserActivity 
} from '../controllers/analyticsController';
import { getWaterAnalytics } from '../controllers/waterAnalyticsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All analytics routes require authentication
router.use(authenticate);

// General analytics (admin only)
router.get('/', authorize('admin'), getAnalytics);

// Water-specific analytics (admin only)
router.get('/water', authorize('admin'), getWaterAnalytics);

// Public analytics endpoints
router.get('/severity', getReportsBySeverity);
router.get('/location', getReportsByLocation);
router.get('/user-activity', getUserActivity);

export default router;
