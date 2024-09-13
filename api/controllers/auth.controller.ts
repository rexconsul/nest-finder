import { Request, Response } from 'express';
import User from '../models/user.model';
import bcryptjs from 'bcryptjs';

export const signUp = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });

  try {
    await newUser.save();
    res.status(201).json('User created successfully!');
  } catch (error: any) {
    res.status(401).json(error.message);
  }
};
