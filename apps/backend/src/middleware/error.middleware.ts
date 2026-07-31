import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public isOperational = true,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError | Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ status: 'error', message: err.message });
    return;
  }

  const mongoErr = err as any;

  if (mongoErr.code === 11000) {
    const field = Object.keys(mongoErr.keyValue)[0];
    res.status(409).json({ status: 'error', message: `${field} already exists` });
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(400).json({ status: 'error', message: err.message });
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ status: 'error', message: 'Invalid token' });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ status: 'error', message: 'Token expired' });
    return;
  }

  logger.error(err.message, err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
};
