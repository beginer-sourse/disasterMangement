import { Router } from 'express';
import { 
  createComment, 
  getComments, 
  updateComment, 
  deleteComment 
} from '../controllers/commentController';
import { authenticate } from '../middleware/auth';
import { validateComment } from '../middleware/validation';

const router = Router();

// Public routes
router.get('/report/:reportId', getComments);

// Protected routes
router.post('/report/:reportId', authenticate, validateComment, createComment);
router.put('/:commentId', authenticate, updateComment);
router.delete('/:commentId', authenticate, deleteComment);

export default router;
