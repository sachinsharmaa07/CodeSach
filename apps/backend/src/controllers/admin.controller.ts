import { Response, NextFunction } from 'express';
import { Submission } from '../models/submission.model';
import { User } from '../models/user.model';
import { Problem } from '../models/problem.model';
import { AuthRequest } from '../types';

export const adminController = {
  async allSubmissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = Math.max(Number(req.query.page) || 1, 1);
      const pageSize = 25;
      const { status, problemId, userId } = req.query;

      const filter: any = {};
      if (status) filter.status = status;
      if (problemId) filter.problem = problemId;
      if (userId) filter.user = userId;

      const [submissions, total] = await Promise.all([
        Submission.find(filter)
          .populate('user', 'username email')
          .populate('problem', 'title difficulty')
          .sort({ createdAt: -1 })
          .skip((page - 1) * pageSize)
          .limit(pageSize),
        Submission.countDocuments(filter),
      ]);

      res.json({
        status: 'success',
        data: { submissions, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } },
      });
    } catch (err) { next(err); }
  },

  async stats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const [userCount, problemCount, submissionCount, acceptedCount] = await Promise.all([
        User.countDocuments({ role: 'user' }),
        Problem.countDocuments({ isActive: true }),
        Submission.countDocuments(),
        Submission.countDocuments({ status: 'accepted' }),
      ]);

      res.json({
        status: 'success',
        data: {
          userCount,
          problemCount,
          submissionCount,
          acceptedCount,
          acceptanceRate: submissionCount ? Math.round((acceptedCount / submissionCount) * 100) : 0,
        },
      });
    } catch (err) { next(err); }
  },

  async allUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await User.find({ role: 'user' })
        .select('username email totalScore streak.current createdAt')
        .sort({ createdAt: -1 })
        .limit(200);
      res.json({ status: 'success', data: { users } });
    } catch (err) { next(err); }
  },
};
