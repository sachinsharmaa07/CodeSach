import { Router, Request, Response } from 'express';

import problemRoutes from './problem.routes';
import submissionRoutes from './submission.routes';
import authRoutes from './auth.routes';
import aiRoutes from './ai.routes';
import leaderboardRoutes from './leaderboard.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'Backend is healthy' });
});

router.use('/auth', authRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);
router.use('/ai', aiRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/admin', adminRoutes);

export default router;
