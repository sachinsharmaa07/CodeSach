import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { submissionController } from '../controllers/submission.controller';
import { executionLimiter } from '../middleware/security.middleware';

const router = Router();
router.use(protect);

router.post('/run', executionLimiter, submissionController.run);
router.post('/submit', executionLimiter, submissionController.submit);
router.get('/me', submissionController.mySubmissions);

export default router;
