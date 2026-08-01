import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { submissionController } from '../controllers/submission.controller.js';
import { executionLimiter } from '../middleware/security.middleware.js';

const router = Router();
router.use(protect);

router.post('/run', executionLimiter, submissionController.run);
router.post('/submit', executionLimiter, submissionController.submit);
router.get('/me', submissionController.mySubmissions);

export default router;