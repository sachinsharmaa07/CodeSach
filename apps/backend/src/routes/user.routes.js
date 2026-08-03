import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { User } from '../models/user.model.js';

const router = Router();

// Get user's DSA sheet progress and solved problems
router.get('/progress', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id, 'dsaSheetProgress solvedProblems').lean();
    res.json({
      status: 'success',
      data: {
        progress: user.dsaSheetProgress || [],
        solvedProblems: user.solvedProblems || [],
      },
    });
  } catch (err) {
    next(err);
  }
});

// Toggle a problem in the DSA sheet progress
router.post('/progress/toggle', protect, async (req, res, next) => {
  try {
    const { problemId } = req.body;
    if (!problemId)
      return res.status(400).json({ status: 'error', message: 'problemId is required' });

    const user = await User.findById(req.user._id);
    const progress = user.dsaSheetProgress || [];

    if (progress.includes(problemId)) {
      user.dsaSheetProgress = progress.filter((id) => id !== problemId);
    } else {
      user.dsaSheetProgress.push(problemId);
    }

    await user.save();
    res.json({ status: 'success', data: { progress: user.dsaSheetProgress } });
  } catch (err) {
    next(err);
  }
});

// Search users by username (public — no auth required)
router.get('/search', async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const limit = Math.min(parseInt(req.query.limit) || 5, 10);
    if (!q) return res.json({ status: 'success', data: { users: [] } });

    const users = await User.find({ username: { $regex: q, $options: 'i' } }, 'username _id')
      .limit(limit)
      .lean();

    res.json({ status: 'success', data: { users } });
  } catch (err) {
    next(err);
  }
});

// Get user profile by ID (public)
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id, 'username _id createdAt').lean();
    if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
    res.json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
});

export default router;
