import { Router, Response, NextFunction } from 'express';
import { protect } from '../middleware/auth.middleware';
import { aiService } from '../services/ai.service';
import { AuthRequest } from '../types';

const router = Router();

router.use(protect);

router.post('/hint', async (req: AuthRequest, res: Response, next: NextFunction) => {
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

router.post('/explain', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { code, language = 'cpp' } = req.body;
    if (!code) {
      res.status(400).json({ status: 'error', message: 'code is required' });
      return;
    }
    const reply = await aiService.explainCode(code, language);
    res.json({ status: 'success', data: { reply } });
  } catch (err) {
    next(err);
  }
});

router.post('/review', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { code, language = 'cpp', problemTitle = '' } = req.body;
    if (!code) {
      res.status(400).json({ status: 'error', message: 'code is required' });
      return;
    }
    const reply = await aiService.reviewCode(code, language, problemTitle);
    res.json({ status: 'success', data: { reply } });
  } catch (err) {
    next(err);
  }
});

export default router;
