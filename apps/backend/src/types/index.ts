import { Request } from 'express';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'user' | 'admin';
        username?: string;
        avatar?: string;
      };
    }
  }
}

export type AuthRequest = Request;

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
