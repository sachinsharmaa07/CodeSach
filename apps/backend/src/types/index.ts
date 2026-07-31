import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin';
  };
}

export interface ApiResponse<T = null> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
}
