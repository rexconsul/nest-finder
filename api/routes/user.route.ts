import express, { Router } from 'express';
import { test } from '../controllers/user.controller';

const router: Router = express.Router();

router.get('/test', test)

export default router;