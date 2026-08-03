import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { protect } from '../middleware/auth.middleware.js';
import * as aiService from '../services/ai.service.js';

const router = Router();

// Rate limiting for AI endpoints
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many AI requests from this IP, please try again after 15 minutes',
  },
});

router.use(protect);
router.use(aiLimiter);

router.post('/hint', async (req, res, next) => {
  try {
    const { problemTitle = '', userCode = '', message, language = 'cpp' } = req.body;

    if (!message) {
      res.status(400).json({ status: 'error', message: 'message is required' });
      return;
    }

    const reply = await aiService.getHint(problemTitle, userCode, message, language);
    res.json({ status: 'success', data: { reply } });
  } catch (err) {
    next(err);
  }
});

router.post('/solution', async (req, res, next) => {
  try {
    const { problemTitle, language = 'cpp' } = req.body;
    if (!problemTitle) {
      res.status(400).json({ status: 'error', message: 'problemTitle is required' });
      return;
    }
    const reply = await aiService.generateSolution(problemTitle, language);
    res.json({ status: 'success', data: { reply } });
  } catch (err) {
    next(err);
  }
});

export default router;
