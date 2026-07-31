import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { leaderboardController } from '../controllers/leaderboard.controller';

const router = Router();
router.get('/', protect, leaderboardController.top);

export default router;
