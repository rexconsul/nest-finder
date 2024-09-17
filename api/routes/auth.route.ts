import express, { Router } from 'express';
import { signUp, signIn, google } from '../controllers/auth.controller';

const router: Router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/google', google)

export default router;
