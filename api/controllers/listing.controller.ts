import { NextFunction, Request, Response } from 'express';
import Listing from '../models/listing.model';
import { errorHandler } from '../utils/error';
import { isValidObjectId } from 'mongoose';

export const getListing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isValidObjectId(req.params.id)) {
    return next(errorHandler(400, 'Invalid listing ID format!'));
  }

  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return next(errorHandler(404, 'Listing not found'));
    }

    return res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit as string) || 9;
    const startIndex = parseInt(req.query.startIndex as string) || 0;
    const searchTerm = (req.query.searchTerm as string) || '';
    const sort = (req.query.sort as string) || 'createdAt';
    const order = (req.query.order as string) || 'desc';

    let query: any = {
      name: { $regex: searchTerm, $options: 'i' },
    };

    // Function to handle boolean filters
    const handleBooleanFilter = (key: string) => {
      const value = req.query[key];
      if (value === 'true') {
        return true;
      } else if (value === 'false') {
        return false;
      }
      return undefined;
    };


    const offer = handleBooleanFilter('offer');
    if (offer !== undefined) {
      query.isOffer = offer;
    }

    const furnished = handleBooleanFilter('furnished');
    if (furnished !== undefined) {
      query.isFurnished = furnished;
    }

    const parking = handleBooleanFilter('parking');
    if (parking !== undefined) {
      query.hasParking = parking;
    }

    // Handle type query
    const type = req.query.type;
    if (type !== undefined && type !== 'all') {
      query.type = type;
    } else {
      query.type = { $in: ['sale', 'rent'] };
    }

    // Query database with the constructed query object
    const listings = await Listing.find(query)
      .sort({
        [sort]: order === 'desc' ? -1 : 1,
      })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};


export const createListing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isValidObjectId(req.params.id)) {
    return next(errorHandler(400, 'Invalid listing ID format!'));
  }

  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }

  if (req.body.user.id !== listing.userData) {
    return next(errorHandler(401, 'You can only delete your own listings!'));
  }

  try {
    await Listing.findByIdAndDelete(req.params.id);

    return res.status(200).json('Listing has been deleted');
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isValidObjectId(req.params.id)) {
    return next(errorHandler(400, 'Invalid listing ID format!'));
  }

  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(errorHandler(404, 'Listing not found!'));
  }

  if (req.body.user.id !== listing.userData) {
    return next(errorHandler(401, 'You can only delete your own listings!'));
  }

  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    return res.status(200).json(updatedListing);
  } catch (error: any) {
    next(error);
  }
};
