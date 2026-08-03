import { User } from '../models/user.model.js';

export const leaderboardController = {
  async top(req, res, next) {
    try {
      const limit = Math.min(Number(req.query.limit) || 50, 100);
      const users = await User.find({ role: 'user' })
        .select('username avatar totalScore streak.current streak.longest solvedProblems')
        .sort({ totalScore: -1 })
        .limit(limit);

      const leaderboard = users.map((u, i) => ({
        rank: i + 1,
        id: u.id,
        username: u.username,
        avatar: u.avatar,
        totalScore: u.totalScore,
        problemsSolved: u.solvedProblems.length,
        currentStreak: u.streak.current,
        longestStreak: u.streak.longest,
      }));

      res.json({ status: 'success', data: { leaderboard } });
    } catch (err) {
      next(err);
    }
  },
};
