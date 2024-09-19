import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
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
} from '../redux/user/userSlice';

interface UserFormData {
  username?: string;
  avatar?: string;
  email?: string;
}

export default function Profile() {
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
      </form>
      <div className="flex justify-between mt-5">
        <span
          onClick={deleteUserHandler}
          className="text-red-700 cursor-pointer"
        >
          Delete Account
        </span>
        <span className="text-red-700 cursor-pointer">Sign Out</span>
      </div>
      <p className="text-red-700 mt-5">{error ? error : ''}</p>
      <p className="text-green-700 mt-5">
        {updateSuccess ? 'User is updated successfully' : ''}
      </p>
    </div>
  );
}
