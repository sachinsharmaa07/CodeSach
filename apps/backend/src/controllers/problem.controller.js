import { z } from 'zod';
import mongoose from 'mongoose';
import { Problem } from '../models/problem.model.js';
import { AppError } from '../middleware/error.middleware.js';

const testCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  isHidden: z.boolean().default(false)
});

const problemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  companies: z.array(z.string()).default([]),
  marks: z.number().min(1),
  constraints: z.string().default(''),
  examples: z.array(z.object({ input: z.string(), output: z.string(), explanation: z.string().optional() })).default([]),
  testCases: z.array(testCaseSchema).min(1),
  starterCode: z.any().default({}),
  solution: z.string().default('')
});

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const problemController = {
  async create(req, res, next) {
    try {
      const body = problemSchema.parse(req.body);
      const slug = slugify(body.title);
      const exists = await Problem.findOne({ $or: [{ title: body.title }, { slug }] });
      if (exists) throw new AppError('A problem with this title already exists', 409);
      const problem = await Problem.create({ ...body, slug, createdBy: req.user.id });
      res.status(201).json({ status: 'success', data: { problem } });
    } catch (err) {next(err);}
  },

  async update(req, res, next) {
    try {
      const body = problemSchema.partial().parse(req.body);
      const update = { ...body };
      if (body.title) update.slug = slugify(body.title);
      const problem = await Problem.findByIdAndUpdate(req.params.id, update, { new: true });
      if (!problem) throw new AppError('Problem not found', 404);
      res.json({ status: 'success', data: { problem } });
    } catch (err) {next(err);}
  },

  async delete(req, res, next) {
    try {
      const problem = await Problem.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
      if (!problem) throw new AppError('Problem not found', 404);
      res.json({ status: 'success', message: 'Problem deactivated' });
    } catch (err) {next(err);}
  },

  async list(req, res, next) {
    try {
      const { difficulty, category, search } = req.query;
      const filter = { isActive: true };
      if (difficulty) filter.difficulty = difficulty;
      if (category) filter.category = category;
      if (search) filter.title = { $regex: search, $options: 'i' };
      const problems = await Problem.find(filter)
        .select('-testCases.expectedOutput -solution')
        .sort({ createdAt: -1 })
        .lean();
      res.json({ status: 'success', data: { problems } });
    } catch (err) {next(err);}
  },

  async getBySlug(req, res, next) {
    try {
      const problem = await Problem.findOne({ slug: req.params.slug, isActive: true })
        .select(req.user?.role === 'admin' ? '' : '-testCases.expectedOutput -solution -testCases.isHidden')
        .lean();
      if (!problem) throw new AppError('Problem not found', 404);

      let isSolved = false;
      if (req.user) {
        const userDoc = await mongoose.model('User').findById(req.user.id, 'solvedProblems dsaSheetProgress').lean();
        if (userDoc) {
          isSolved = 
            (userDoc.solvedProblems && userDoc.solvedProblems.some(id => id.toString() === problem._id.toString())) ||
            (userDoc.dsaSheetProgress && userDoc.dsaSheetProgress.includes(problem.slug));
        }
      }

      res.json({ status: 'success', data: { problem, isSolved } });
    } catch (err) {next(err);}
  }
};