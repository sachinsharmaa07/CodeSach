import { Request, Response } from 'express';

export const authController = {
  register: async (req: Request, res: Response) => {
    res.status(501).json({ status: 'error', message: 'Not implemented yet' });
  },
  login: async (req: Request, res: Response) => {
    res.status(501).json({ status: 'error', message: 'Not implemented yet' });
  },
  refresh: async (req: Request, res: Response) => {
    res.status(501).json({ status: 'error', message: 'Not implemented yet' });
  },
  me: async (req: Request, res: Response) => {
    res.status(501).json({ status: 'error', message: 'Not implemented yet' });
  },
};
