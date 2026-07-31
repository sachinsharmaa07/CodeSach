import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { submissionService } from '../services/submission.service';
import { Submission } from '../models/submission.model';
import { AuthRequest } from '../types';

const runSchema = z.object({
  problemId: z.string().min(1),
  code: z.string().min(1).max(20000, 'Code exceeds maximum allowed length'),
  language: z.enum(['cpp', 'java', 'python', 'javascript', 'c']),
});

export const submissionController = {
  async run(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { problemId, code, language } = runSchema.parse(req.body);
      const results = await submissionService.run(req.user!.id, problemId, code, language);
      res.json({ status: 'success', data: { results } });
    } catch (err) { next(err); }
  },

  async submit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { problemId, code, language } = runSchema.parse(req.body);
      const result = await submissionService.submit(req.user!.id, problemId, code, language);
      res.json({ status: 'success', data: result });
    } catch (err) { next(err); }
  },

  async mySubmissions(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { problemId } = req.query;
      const filter: any = { user: req.user!.id };
      if (problemId) filter.problem = problemId;
      const submissions = await Submission.find(filter).sort({ createdAt: -1 }).limit(50);
      res.json({ status: 'success', data: { submissions } });
    } catch (err) { next(err); }
  },
};
