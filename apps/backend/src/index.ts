import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { connectDB } from './config/db';
import { logger } from './utils/logger';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

import passport from 'passport';
import './config/passport';
import authRoutes from './routes/auth.routes';
import aiRoutes from './routes/ai.routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(passport.initialize());

app.use('/api/v1', routes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/ai', aiRoutes);

app.use(errorHandler);

const start = async () => {
  await connectDB();
  app.listen(Number(env.PORT), () => {
    logger.info(`🚀 Server → http://localhost:${env.PORT}/api/v1/health`);
  });
};

start();
