import { Request, Response } from 'express';

export const test = (_req: Request, res: Response): void => {
  res.json({
    message: 'User api route is working!!!!',
  })
}