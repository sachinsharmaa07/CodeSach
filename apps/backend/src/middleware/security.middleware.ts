import helmet from 'helmet';
import hpp from 'hpp';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

export const helmetMiddleware = helmet();

export const sanitizeMiddleware = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ key }) => {
    console.warn(`⚠️  Sanitized potentially malicious key: ${key}`);
  },
});

export const hppMiddleware = hpp();

// General API limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again later' },
});

// Strict limiter for auth endpoints (brute-force protection)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many auth attempts, please try again in 15 minutes' },
});

// Tighter limiter for code execution (Judge0 is CPU-heavy — protect your own host)
export const executionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many run/submit requests, slow down' },
});

// AI limiter (Gemini free tier has its own quota — don't let one user burn it)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many AI requests, please wait a minute' },
});
