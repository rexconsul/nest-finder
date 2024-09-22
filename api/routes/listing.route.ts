import express, { Router } from 'express';
import {
  getListing,
  createListing,
  deleteListing,
  updateListing,
} from '../controllers/listing.controller';
import { verifyUser } from '../utils/verifyUser';

const router: Router = express.Router();

router.get('/:id', getListing)
router.post('/create', verifyUser, createListing);
router.delete('/delete/:id', verifyUser, deleteListing);
router.put('/update/:id', verifyUser, updateListing);

export default router;
