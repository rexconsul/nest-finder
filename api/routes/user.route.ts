import express, { Router } from 'express';
import { test, updateUser, deleteUser } from '../controllers/user.controller';
import { verifyUser } from '../utils/verifyUser';

const router: Router = express.Router();

router.get('/test', test);
router.post('/update/:id', verifyUser, updateUser);
router.delete('/delete/:id', verifyUser, deleteUser)

export default router;
