import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import compression from 'compression';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/error.middleware.js';
import { helmetMiddleware, sanitizeMiddleware, hppMiddleware, apiLimiter } from './middleware/security.middleware.js';
import routes from './routes/index.js';
import './config/passport.js';

const app = express();

app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(compression());
if (env.NODE_ENV !== 'production') app.use(morgan('dev'));
app.use(helmetMiddleware);
app.use(sanitizeMiddleware);
app.use(hppMiddleware);
app.use(passport.initialize());
app.use('/api', apiLimiter);

app.use('/api/v1', routes);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(env.PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${env.PORT}`));
});