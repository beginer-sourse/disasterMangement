import { Router } from 'express';
import { 
  createReport, 
  getReports, 
  getReportById, 
  updateReport, 
  deleteReport, 
  voteReport,
  getUserReports
} from '../controllers/reportController';
import { authenticate } from '../middleware/auth';
import { validateReport } from '../middleware/validation';
import { uploadSingle, handleUploadError } from '../middleware/upload';

const router = Router();

// Public routes
router.get('/', getReports);

// Protected routes
router.get('/user/my-reports', authenticate, getUserReports);
router.get('/:id', getReportById);
router.post('/', authenticate, uploadSingle, handleUploadError, validateReport, createReport);
router.put('/:id', authenticate, updateReport);
router.delete('/:id', authenticate, deleteReport);
router.post('/:id/vote', authenticate, voteReport);

export default router;
