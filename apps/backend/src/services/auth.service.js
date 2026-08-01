import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';
import { env } from '../config/env.js';

const signAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

const signRefreshToken = (payload) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
};

export const authService = {
  googleLogin(user) {
    const payload = { id: user.id, email: user.email, role: user.role };
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload)
    };
  },
  
  async register(username, email, password) {
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) throw new Error('Username or email already exists');
    
    const user = await User.create({ username, email, password });
    const payload = { id: user._id, email: user.email, role: user.role };
    return {
      user: { id: user._id, username: user.username, email: user.email, role: user.role, avatar: user.avatar },
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload)
    };
  },
  
  async login(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new Error('Invalid credentials');
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Invalid credentials');
    
    const payload = { id: user._id, email: user.email, role: user.role };
    return {
      user: { id: user._id, username: user.username, email: user.email, role: user.role, avatar: user.avatar },
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload)
    };
  }
};