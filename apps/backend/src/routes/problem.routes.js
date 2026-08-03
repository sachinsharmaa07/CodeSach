import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { problemController } from '../controllers/problem.controller.js';

const router = Router();

router.get('/', protect, problemController.list);
router.get('/:slug', protect, problemController.getBySlug);
router.post('/', protect, requireAdmin, problemController.create);
router.patch('/:id', protect, requireAdmin, problemController.update);
router.delete('/:id', protect, requireAdmin, problemController.delete);

export default router;
