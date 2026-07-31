import { Router, Request, Response, NextFunction } from 'express';
import passport from 'passport';
import '../config/passport';
import { authController } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { authService } from '../services/auth.service';
import { IUser } from '../models/user.model';
import { env } from '../config/env';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.get('/me', protect, authController.me);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as IUser;
      const result = authService.googleLogin({
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
        avatar: user.avatar,
      });
      const params = new URLSearchParams({
        token: result.accessToken,
        refreshToken: result.refreshToken,
        user: JSON.stringify(result.user),
      });
      res.redirect(`${env.CLIENT_URL}/auth/callback?${params.toString()}`);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
