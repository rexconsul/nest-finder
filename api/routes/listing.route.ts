import express, { Router } from 'express';
import { createListing } from '../controllers/listing.controller';
import { verifyUser } from '../utils/verifyUser';

const router: Router = express.Router();

router.post('/create', verifyUser, createListing);

export default router;
