import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { ChangeEvent, FormEvent, useState } from 'react';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useNavigate } from 'react-router-dom';

interface ListingFormData {
  name: string;
  description: string;
  address: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  regularPrice: number;
  discountedPrice: number;
  isOffer: boolean;
  hasParking: boolean;
  isFurnished: false;
  imageUrls: string[];
}

export default function CreateListing(): JSX.Element {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [files, setFiles] = useState<FileList | []>([]);
  const [formData, setFormData] = useState<ListingFormData>({
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountedPrice: 0,
    isOffer: false,
    hasParking: false,
    isFurnished: false,
    imageUrls: [],
  });
  console.log(formData, 'formData');

  const [imageUploadError, setImageUploadError] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');
  const [formLoading, setFormLoading] = useState<boolean>(false);

  const storeImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const fileChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const fileUploadHandler = () => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError('');
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError('');
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError('Image upload failed (2 mb max per image)');
          setUploading(false);
          console.log(err);
        });
    } else {
      setImageUploadError('You can only upload 6 images per listing');
      setUploading(false);
    }
  };

  const deleteImageHandler = (index: number) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_url, i) => i !== index),
    });
  };

  const formChangeHandler = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.target.id === 'sale' || e.target.id === 'rent') {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }

    if (
      e.target instanceof HTMLInputElement &&
      (e.target.id === 'hasParking' ||
        e.target.id === 'isOffer' ||
        e.target.id === 'isFurnished')
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (
      e.target.type === 'number' ||
      e.target.type === 'text' ||
      e.target.type === 'textarea'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      if (formData.imageUrls.length < 1)
        return setFormError('You must upload at least one image.');
      if (+formData.regularPrice < +formData.discountedPrice)
        return setFormError('Discount price must be lower than regular price.');

      setFormLoading(true);
      setFormError('');

      const res = await fetch('/api/listing/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userData: currentUser?._id,
        }),
      });

      const data = await res.json();
      setFormLoading(false);

      if (data.success === false) {
        setFormError(data.message);
      }

      navigate(`/listing/${data._id}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      setFormError(error.message);
      setFormLoading(false);
    }
  };

  return (
    <main className="p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">
        Create a Listing
      </h1>
      <form
        onSubmit={submitHandler}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            id="name"
            placeholder="Name"
            className="border p-3 rounded-lg"
            maxLength={62}
            minLength={10}
            required
            onChange={formChangeHandler}
            value={formData.name}
          />
          <textarea
            id="description"
            placeholder="Description"
            className="border p-3 rounded-lg"
            required
            onChange={formChangeHandler}
            value={formData.description}
          />
          <input
            type="text"
            id="address"
            placeholder="Address"
            className="border p-3 rounded-lg"
            required
            onChange={formChangeHandler}
            value={formData.address}
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input
                className="w-5"
                type="checkbox"
                id="sale"
                onChange={formChangeHandler}
                checked={formData.type === 'sale'}
              />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input
                className="w-5"
                type="checkbox"
                id="rent"
                onChange={formChangeHandler}
                checked={formData.type === 'rent'}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                className="w-5"
                type="checkbox"
                id="hasParking"
                onChange={formChangeHandler}
                checked={formData.hasParking}
              />
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2">
              <input
                className="w-5"
                type="checkbox"
                id="isFurnished"
                onChange={formChangeHandler}
                checked={formData.isFurnished}
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input
                className="w-5"
                type="checkbox"
                id="isOffer"
                onChange={formChangeHandler}
                checked={formData.isOffer}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                className="p-3 border border-gray-300 rounded-lg"
                type="number"
                id="bedrooms"
                min={1}
                max={10}
                required
                onChange={formChangeHandler}
                value={formData.bedrooms}
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                className="p-3 border border-gray-300 rounded-lg"
                type="number"
                id="bathrooms"
                min={0}
                max={10}
                required
                onChange={formChangeHandler}
                value={formData.bathrooms}
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                className="p-3 border border-gray-300 rounded-lg"
                type="number"
                id="regularPrice"
                min={50}
                max={10000000}
                required
                onChange={formChangeHandler}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <p>Regular Price</p>
                <span className="text-xs">
                  {formData.type === 'sale' ? '($)' : '($ / month)'}
                </span>
              </div>
            </div>
            {formData.isOffer && (
              <div className="flex items-center gap-2">
                <input
                  className="p-3 border border-gray-300 rounded-lg"
                  type="number"
                  id="discountedPrice"
                  min={50}
                  max={10000000}
                  required
                  onChange={formChangeHandler}
                  value={formData.discountedPrice}
                />
                <div className="flex flex-col items-center">
                  <p>Discounted Price</p>
                  <span className="text-xs">
                    {formData.type === 'sale' ? '($)' : '($ / month)'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold ">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
              onChange={fileChangeHandler}
            />
            <button
              type="button"
              disabled={uploading}
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
              onClick={fileUploadHandler}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          <p className="text-red-700 text-sm">
            {imageUploadError && imageUploadError}
          </p>
          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => (
              <div
                key={url}
                className="flex justify-between p-3 border items-center"
              >
                <img
                  className="w-20 h-20 object-contain rounded-lg"
                  src={url}
                  alt="listing_image"
                />
                <button
                  type="button"
                  className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75"
                  onClick={() => deleteImageHandler(index)}
                >
                  Delete
                </button>
              </div>
            ))}
          <button
            disabled={formLoading || uploading}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80 mt-2"
          >
            {formLoading ? 'Creating...' : 'Create listing'}
          </button>
          {formError && <p className="text-red-700 text-sm">{formError}</p>}
        </div>
      </form>
    </main>
  );
}
