import { Request, Response } from 'express';
import User from '../models/user.model';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error';
import jwt from 'jsonwebtoken';

export const signUp = async (
  req: Request,
  res: Response,
  next: any
): Promise<void> => {
  const { username, email, password } = req.body;
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });

  try {
    await newUser.save();
    res.status(201).json('User created successfully!');
  } catch (error: any) {
    next(error);
  }
};

export const signIn = async (
  req: Request,
  res: Response,
  next: any
): Promise<void> => {
  const { email, password } = req.body;

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, 'User not found!'));
    }

    const validPassword = await bcryptjs.compareSync(
      password,
      validUser.password as string
    );
    if (!validPassword) {
      return next(errorHandler(401, 'Wrong credential!'));
    }

    const token = jwt.sign(
      { id: validUser._id },
      process.env.JWT_SECRET as any | null
    );
    const { password: _, ...rest } = validUser.toObject();

    res
      .cookie('access_token', token, { httpOnly: true })
      .status(200)
      .json(rest);
  } catch (error) {
    next(error);
  }
};

export const google = async (req: Request, res: Response, next: any) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET as any | null
      );

      const { password: pass, ...rest } = user.toObject();

      res
        .cookie('access_token', token, { httpOnly: true })
        .status(200)
        .json(rest);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);

      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

      const newUserName: string =
        req.body.name.split(' ').join('').toLowerCase() +
        Math.random().toString(36).slice(-8);

      const newUser = new User({
        username: newUserName,
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.photo,
      });

      await newUser.save();

      const token = jwt.sign(
        { id: newUser._id },
        process.env.JWT_SECRET as any | null
      );
      const { password: pass, ...rest } = newUser.toObject();
      res
        .cookie('access_token', token, { httpOnly: true })
        .status(200)
        .json(rest);
    }
  } catch (error) {
    next(error);
  }
};
