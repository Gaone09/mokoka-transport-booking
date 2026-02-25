import { useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

export default function FindBooking() {
  const [code, setCode] = useState("");
  const [booking, setBooking] = useState(null);

  const search = async () => {
    const res = await fetch(`${API_URL}/bookings/${code}`);
    const data = await res.json();
    setBooking(data);
  };

  return (
    <div>
      <input placeholder="Booking code" onChange={e => setCode(e.target.value)} />
      <button onClick={search}>Find</button>
      {booking && <pre>{JSON.stringify(booking, null, 2)}</pre>}
    </div>
  );
}
