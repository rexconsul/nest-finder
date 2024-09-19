import mongoose, { Document, Schema } from 'mongoose';

export interface IListing extends Document {
  name: string;
  description: string;
  address: string;
  regularPrice: number;
  discountedPrice: number;
  bathrooms: number;
  bedrooms: number;
  isFurnished: boolean;
  hasParking: boolean;
  type: string;
  isOffer: boolean;
  imageUrls: string[];
  userData: string;
}

const listingSchema: Schema = new mongoose.Schema<IListing>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    regularPrice: {
      type: Number,
      required: true,
    },
    discountedPrice: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    isFurnished: {
      type: Boolean,
      required: true,
    },
    hasParking: {
      type: Boolean,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    isOffer: {
      type: Boolean,
      required: true,
    },
    imageUrls: {
      type: [String],
      required: true,
    },
    userData: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;
