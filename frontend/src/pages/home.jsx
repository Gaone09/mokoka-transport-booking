import { useEffect, useState } from "react";
import PassengerSelector from "../components/PassengerSelector";

const API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const [routes, setRoutes] = useState([]);
  const [route, setRoute] = useState(null);
  const [trips, setTrips] = useState([]);
  const [tripId, setTripId] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState(1);

  useEffect(() => {
    fetch(`${API_URL}/routes`).then(r => r.json()).then(setRoutes);
  }, []);

  useEffect(() => {
    if (!route) return;
    fetch(`${API_URL}/trips/route/${route.id}`).then(r => r.json()).then(setTrips);
  }, [route]);

  const book = async () => {
    const res = await fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripId, pickup, dropoff, date, seats: passengers }),
    });
    const data = await res.json();
    alert(`Booking ref: ${data.booking.booking_ref}`);
  };

  return (
    <div>
      <h1>Book Trip</h1>

      <select onChange={e => setRoute(routes.find(r => r.id == e.target.value))}>
        <option>Select route</option>
        {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
      </select>

      <select onChange={e => setTripId(e.target.value)}>
        <option>Select trip</option>
        {trips.map(t => <option key={t.id} value={t.id}>{t.departure_time}</option>)}
      </select>

      <input type="date" onChange={e => setDate(e.target.value)} />

      <PassengerSelector value={passengers} onChange={setPassengers} />

      <button onClick={book}>Book</button>
    </div>
  );
}
