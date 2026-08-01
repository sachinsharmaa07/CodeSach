import { Router } from 'express';

import problemRoutes from './problem.routes.js';
import submissionRoutes from './submission.routes.js';
import authRoutes from './auth.routes.js';
import aiRoutes from './ai.routes.js';
import leaderboardRoutes from './leaderboard.routes.js';
import adminRoutes from './admin.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'success', message: 'Backend is healthy' });
});

router.use('/auth', authRoutes);
router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);
router.use('/ai', aiRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);

export default router;