import express, { Express } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route';
import authRouter from './routes/auth.route';
import listingRouter from './routes/listing.route';
import cookieParser from 'cookie-parser';

dotenv.config();

mongoose
  .connect(process.env.MONGO as string)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => console.log(err));

const app: Express = express();

app.use(express.json());

app.use(cookieParser());

app.listen(3000, () => {
  console.log('Server is running on port 3000!!!');
});

app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);

// middleware to handle errors
app.use((err: any, _req: any, res: any, _next: any) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});
