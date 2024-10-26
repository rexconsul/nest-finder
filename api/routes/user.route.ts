import express, { Router } from 'express';
import {
  test,
  updateUser,
  deleteUser,
  getUserListings,
  getUser,
} from '../controllers/user.controller';
import { verifyUser } from '../utils/verifyUser';

const router: Router = express.Router();

router.get('/test', test);
router.post('/update/:id', verifyUser, updateUser);
router.delete('/delete/:id', verifyUser, deleteUser);
router.get('/listings/:id', verifyUser, getUserListings);
router.get('/:id', verifyUser, getUser);

export default router;
