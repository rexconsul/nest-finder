import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import {
  getDownloadURL,
  getStorage,
  ref,
  StorageError,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
  signOutUserFailure,
  signOutUserSuccess,
} from '../redux/user/userSlice';
import { Link } from 'react-router-dom';

interface UserFormData {
  username?: string;
  avatar?: string;
  email?: string;
}

interface IListing {
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

export default function Profile(): JSX.Element {
  const dispatch = useDispatch();
  const { currentUser, loading, error } = useSelector(
    (state: RootState) => state.user
  );
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePercentage, setFilePercentage] = useState<number>(0);
  const [fileUploadError, setFileUploadError] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<UserFormData>>({});
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [userListings, setUserListings] = useState(Array<IListing>);
  const [showListingsError, setShowListingsError] = useState<boolean>(false);

  const imgClickHandler = () => {
    if (fileRef.current) {
      fileRef.current.click();
    }
  };

  const fileChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const fileUploadHandler = (file: File) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + '_' + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePercentage(Math.round(progress));
      },
      (error: StorageError) => {
        setFileUploadError(true);
        console.log('Upload error', error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
          setFormData({ ...formData, avatar: downloadUrl });
        });
      }
    );
  };

  const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser?._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const deleteUserHandler = async () => {
    try {
      dispatch(deleteUserStart());

      const res = await fetch(`/api/user/delete/${currentUser?._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const signOutHandler = async () => {
    try {
      dispatch(signOutUserStart());

      const res = await fetch('/api/auth/signout');
      const data = await res.json();

      if (data.success === false) return;

      dispatch(signOutUserSuccess());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  const renderUploadStatus = () => {
    if (fileUploadError) {
      return (
        <span className="text-red-700">
          Error Image Upload (Image must be less than 2MB)
        </span>
      );
    }

    if (filePercentage > 0 && filePercentage < 100) {
      return (
        <span className="text-slate-700">{`Uploading ${filePercentage}%`}</span>
      );
    }

    if (filePercentage === 100) {
      return (
        <span className="text-green-700">Image Successfully Uploaded</span>
      );
    }

    return null;
  };

  const showListingHandler = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser?._id}`);
      const data = await res.json();

      if (data.success === false) {
        setShowListingsError(true);
        return;
      }

      setUserListings(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setShowListingsError(true);
    }
  };

  useEffect(() => {
    if (file) {
      fileUploadHandler(file);
    }
  }, [file]);

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={submitHandler} className="flex flex-col gap-4">
        <input
          onChange={fileChangeHandler}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <img
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
          src={formData.avatar || currentUser?.avatar}
          alt="profile"
          onClick={imgClickHandler}
        />
        <p className="text-sm self-center">{renderUploadStatus()}</p>
        <input
          id="username"
          className="border p-3 rounded-lg"
          defaultValue={currentUser?.username}
          type="text"
          placeholder="username"
          onChange={changeHandler}
        />
        <input
          id="email"
          className="border p-3 rounded-lg"
          defaultValue={currentUser?.email}
          type="email"
          placeholder="email"
          onChange={changeHandler}
        />
        <input
          id="password"
          className="border p-3 rounded-lg"
          type="password"
          placeholder="password"
          onChange={changeHandler}
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? 'Loading' : 'Update'}
        </button>
        <Link
          className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95"
          to={'/create-listing'}
        >
          Create Listing
        </Link>
      </form>
      <div className="flex justify-between mt-5">
        <span
          className="text-red-700 cursor-pointer"
          onClick={deleteUserHandler}
        >
          Delete Account
        </span>
        <span className="text-red-700 cursor-pointer" onClick={signOutHandler}>
          Sign Out
        </span>
      </div>
      <p className="text-red-700 mt-5">{error ? error : ''}</p>
      <p className="text-green-700 mt-5">
        {updateSuccess ? 'User is updated successfully' : ''}
      </p>
      <button onClick={showListingHandler} className="text-green-700 w-full">
        Show Listings
      </button>
      <p className="text-red-700 mt-5">
        {showListingsError ? 'Error showing listings' : ''}
      </p>
      {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-center mt-7 text-2xl font-semibold">
            Your Listings
          </h1>
          {userListings.map((listing) => (
            <div
              key={listing._id}
              className="flex border rounded-lg p-3 justify-between items-center gap-4"
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  className="h-16 w-16 object-contain"
                  src={listing.imageUrls[0]}
                  alt="listing_cover_image"
                />
              </Link>
              <Link
                className="text-slate-700 font-semibold hover:underline truncate flex-1"
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>
              <div className="flex flex-col items-center">
                <button className="text-red-700 uppercase hover:underline">
                  Delete
                </button>
                <button className="text-green-700 uppercase hover:underline">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
