export default interface IListing {
  _id: string;
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