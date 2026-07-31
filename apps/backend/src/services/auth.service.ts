import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const signAccessToken = (payload: { id: string; email: string; role: string }) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

const signRefreshToken = (payload: { id: string; email: string; role: string }) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
};

export const authService = {
  googleLogin(user: {
    id: string;
    email: string;
    role: 'user' | 'admin';
    username: string;
    avatar: string;
  }) {
    const payload = { id: user.id, email: user.email, role: user.role };
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  },
};
