import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { adminController } from '../controllers/admin.controller.js';

const router = Router();
router.use(protect, requireAdmin);

router.get('/submissions', adminController.allSubmissions);
router.get('/stats', adminController.stats);
router.get('/users', adminController.allUsers);

export default router;
