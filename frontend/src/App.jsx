const API_URL = import.meta.env.VITE_API_URL;

import { useState, useEffect } from "react";

function App() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [tripType, setTripType] = useState("one-way");
  const [date, setDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [seats, setSeats] = useState(1);

  // Fetch routes
  useEffect(() => {
    fetch(`${API_URL}/routes`)
      .then((res) => res.json())
      .then((data) => setRoutes(data))
      .catch((err) => console.error("Failed to load routes:", err));
  }, []);

  // Fetch trips when route changes
  useEffect(() => {
    if (!selectedRoute) return;
    fetch(`${API_URL}/trips/route/${selectedRoute.id}`)
      .then((res) => res.json())
      .then((data) => setTrips(data))
      .catch((err) => console.error("Failed to load trips:", err));
  }, [selectedRoute]);

  const handleRouteChange = (e) => {
    const routeId = Number(e.target.value);

    if (!routeId) {
      setSelectedRoute(null);
      setTrips([]);
      setSelectedTripId("");
      return;
    }

    const route = routes.find((r) => r.id === routeId);
    setSelectedRoute(route || null);
    setSelectedTripId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoute || !selectedTripId || !pickup || !dropoff || !date) {
      alert("Fill in all required fields");
      return;
    }

    const payload = {
      tripId: selectedTripId,
      pickup,
      dropoff,
      date,
      returnDate: tripType === "round-trip" ? returnDate : null,
      tripType,
      seats,
    };

    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) alert(`Booking confirmed: ${data.booking.booking_ref}`);
      else alert(data.message);
    } catch (err) {
      console.error("Booking failed:", err);
    }
  };

  return (
    <div className="container">
      <h1>Book Your Trip</h1>
      <form onSubmit={handleSubmit}>
        <select value={selectedRoute?.id || ""} onChange={handleRouteChange}>
          <option value="">Select Route</option>
          {routes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>

        <select
          value={selectedTripId}
          onChange={(e) => setSelectedTripId(e.target.value)}
          disabled={!trips.length}
        >
          <option value="">Select Trip</option>
          {trips.map((t) => (
            <option key={t.id} value={t.id}>
              {t.departure_time} ({t.capacity} seats)
            </option>
          ))}
        </select>

        <input
          placeholder="Pickup"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
        />
        <input
          placeholder="Dropoff"
          value={dropoff}
          onChange={(e) => setDropoff(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {tripType === "round-trip" && (
          <input
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        )}

        <label>
          <input
            type="radio"
            value="one-way"
            checked={tripType === "one-way"}
            onChange={(e) => setTripType(e.target.value)}
          />{" "}
          One-way
        </label>
        <label>
          <input
            type="radio"
            value="round-trip"
            checked={tripType === "round-trip"}
            onChange={(e) => setTripType(e.target.value)}
          />{" "}
          Round-trip
        </label>

        <input
          type="number"
          value={seats}
          min={1}
          max={
            selectedTripId
              ? trips.find((t) => t.id === parseInt(selectedTripId))?.capacity
              : 1
          }
          onChange={(e) => setSeats(e.target.value)}
        />

        <button type="submit">Book</button>
      </form>
    </div>
  );
}

export default App;
