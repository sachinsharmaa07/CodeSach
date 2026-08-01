import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { aiLimiter } from '../middleware/security.middleware.js';
import { aiService } from '../services/ai.service.js';

const router = Router();

router.post('/general', async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ status: 'error', message: 'message is required' });
      return;
    }
    const reply = await aiService.chat(
      [{ role: 'user', text: message }],
      '', '', 'javascript'
    );
    res.json({ status: 'success', data: { reply } });
  } catch (err) {
    next(err);
  }
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

router.post('/explain', async (req, res, next) => {
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

router.post('/review', async (req, res, next) => {
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

router.post('/solution', async (req, res, next) => {
  try {
    const { problemTitle = '', userCode = '', language = 'cpp' } = req.body;
    const reply = await aiService.getSolution(problemTitle, userCode, language);
    res.json({ status: 'success', data: { reply } });
  } catch (err) {
    next(err);
  }
});

router.post('/chat', async (req, res, next) => {
  try {
    const { messages = [], problemTitle = '', userCode = '', language = 'cpp' } = req.body;
    if (!messages.length) {
      res.status(400).json({ status: 'error', message: 'messages array is required' });
      return;
    }
    const reply = await aiService.chat(messages, problemTitle, userCode, language);
    res.json({ status: 'success', data: { reply } });
  } catch (err) {
    next(err);
  }
});

// ─── General chat (simple message string — for home page AI widget) ───────────


export default router;