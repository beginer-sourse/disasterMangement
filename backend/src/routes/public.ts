import { Router } from 'express';
import { makeUserAdmin } from '../controllers/adminController';

const router = Router();

// Public route to make user admin (for testing)
router.post('/make-admin', makeUserAdmin);

export default router;
