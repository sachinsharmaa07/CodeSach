import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';

export const helmetMiddleware = helmet();

export const sanitizeMiddleware = (req, res, next) => {
  // Temporary bypass for express-mongo-sanitize crashing on Node 22
  next();
};

export const hppMiddleware = hpp();

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again later' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many auth attempts, please try again in 15 minutes' },
});

export const executionLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many run/submit requests, slow down' },
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many AI requests, please wait a minute' },
});
