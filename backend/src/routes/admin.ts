import { Router } from 'express';
import { 
  verifyReport, 
  getAllUsers, 
  updateUserRole, 
  getPendingReports, 
  getAllReports,
  deleteUser,
  blockUser,
  unblockUser
} from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// Report management
router.get('/reports', getAllReports);
router.put('/reports/:id/verify', verifyReport);
router.get('/reports/pending', getPendingReports);

// User management
router.get('/users', getAllUsers);
router.put('/users/:userId/role', updateUserRole);
router.put('/users/:userId/block', blockUser);
router.put('/users/:userId/unblock', unblockUser);
router.delete('/users/:userId', deleteUser);

export default router;
