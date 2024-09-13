import express, { Express } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user.route'
import authRouter from './routes/auth.route'

dotenv.config();

mongoose
  .connect(process.env.MONGO as string)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => console.log(err));

const app: Express = express();

app.use(express.json());

app.listen(3000, () => {
  console.log('Server is running on port 3000!!!');
});

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
