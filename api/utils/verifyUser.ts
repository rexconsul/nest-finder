import { NextFunction, Request, Response } from 'express';
import { errorHandler } from './error';
import jwt from 'jsonwebtoken';

export const verifyUser = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies.access_token;

  if (!token) return next(errorHandler(401, 'Unauthorized!'));

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) return next(errorHandler(403, 'Forbidden'));

    req.body.user = user;
    next();
  });
};
