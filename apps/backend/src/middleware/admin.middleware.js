import { AppError } from './error.middleware.js';

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return next(new AppError('Admin access required', 403));
  next();
};
