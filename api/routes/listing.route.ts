import express, { Router } from 'express';
import {
  getListing,
  getListings,
  createListing,
  deleteListing,
  updateListing,
} from '../controllers/listing.controller';
import { verifyUser } from '../utils/verifyUser';

const router: Router = express.Router();

router.get('/get/:id', getListing)
router.get('/get', getListings);
router.post('/create', verifyUser, createListing);
router.delete('/delete/:id', verifyUser, deleteListing);
router.put('/update/:id', verifyUser, updateListing);

export default router;
