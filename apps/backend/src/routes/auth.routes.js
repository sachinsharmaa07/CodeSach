import { Router } from 'express';
import passport from 'passport';
import { URLSearchParams } from 'url';
import '../config/passport.js';
import { authController } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { authService } from '../services/auth.service.js';
import { env } from '../config/env.js';
import { authLimiter } from '../middleware/security.middleware.js';

const router = Router();

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
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
  (req, res, next) => {
    try {
      const user = req.user;
      const result = authService.googleLogin({
        id: user._id || user.id,
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
