import express, { Router } from 'express';
import { test, updateUser } from '../controllers/user.controller';
import { verifyUser } from '../utils/verifyUser';

const router: Router = express.Router();

router.get('/test', test);
router.post('/update/:id', verifyUser, updateUser);

export default router;
