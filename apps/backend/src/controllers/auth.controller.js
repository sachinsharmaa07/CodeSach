import { User } from '../models/user.model.js';
import { authService } from '../services/auth.service.js';

export const authController = {
  register: async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password)
        return res.status(400).json({ status: 'error', message: 'All fields are required' });
      const result = await authService.register(username, email, password);
      res.status(201).json({ status: 'success', data: result });
    } catch (err) {
      if (err.message.includes('already exists'))
        return res.status(409).json({ status: 'error', message: err.message });
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password)
        return res.status(400).json({ status: 'error', message: 'All fields are required' });
      const result = await authService.login(email, password);
      res.status(200).json({ status: 'success', data: result });
    } catch (err) {
      if (err.message === 'Invalid credentials')
        return res.status(401).json({ status: 'error', message: err.message });
      next(err);
    }
  },

  me: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });
      res.status(200).json({ status: 'success', data: { user } });
    } catch (err) {
      next(err);
    }
  },
};
