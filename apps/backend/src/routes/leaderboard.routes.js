import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { leaderboardController } from '../controllers/leaderboard.controller.js';

const router = Router();
router.get('/', protect, leaderboardController.top);

export default router;
