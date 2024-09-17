import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

export default function Profile() {
  const { currentUser } = useSelector((state: RootState) => state.user);

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form className="flex flex-col gap-4">
        <img
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
          src={currentUser?.avatar}
          alt="profile"
        />
        <input
          id="username"
          className="border p-3 rounded-lg"
          type="text"
          placeholder="username"
        />
        <input
          id="email"
          className="border p-3 rounded-lg"
          type="email"
          placeholder="email"
        />
        <input
          id="password"
          className="border p-3 rounded-lg"
          type="password"
          placeholder="password"
        />
        <button className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80">
          Update
        </button>
      </form>
      <div className='flex justify-between mt-5'>
        <span className='text-red-700 cursor-pointer'>Delete Account</span>
        <span className='text-red-700 cursor-pointer'>Sign Out</span>
      </div>
    </div>
  );
}
