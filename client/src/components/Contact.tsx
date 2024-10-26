import { ChangeEvent, useEffect, useState } from 'react';
import IUser from '../types/user';
import IListing from '../types/listing';
import { Link } from 'react-router-dom';

interface ContactProps {
  listing: Partial<IListing>;
}

export default function Contact({ listing }: ContactProps): JSX.Element {
  const [landlord, setLandload] = useState<Partial<IUser>>({});
  const [message, setMessage] = useState<string>();

  const messageHandler = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  useEffect(() => {
    const fetchLandlord = async () => {
      try {
        const res = await fetch(`/api/user/${listing.userData}`);
        const data = await res.json();
        setLandload(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchLandlord();
  }, [listing.userData]);

  return (
    <>
      {landlord && (
        <div className="flex flex-col gap-2">
          <p>
            Contact <span className="font-semibold">{landlord.username}</span>{' '}
            for{' '}
            <span className="font-semibold">{listing.name?.toLowerCase()}</span>
          </p>
          <textarea
            name="message"
            id="message"
            rows={2}
            value={message}
            onChange={messageHandler}
            placeholder="Enter your message here..."
            className="w-full border p3 rounded-lg"
          />
          <Link
            to={`mailto:${landlord.email}?subject=Regarding ${listing.name}&body=${message}`}
            className="bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95"
          >
            Send Message
          </Link>
        </div>
      )}
    </>
  );
}
