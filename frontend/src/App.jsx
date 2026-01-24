const API_URL = import.meta.env.VITE_API_URL;

import { useState, useEffect, useRef } from "react";
import { QRCodeCanvas as QRCode } from 'qrcode.react';

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
  const [stops, setStops] = useState([]);
  const [seats, setSeats] = useState(1);
  const [passengers, setPassengers] = useState(1);
  const [maxPassengers, setMaxPassengers] = useState(0);
  const [bookingRef, setBookingRef] = useState("");
  const qrRef = useRef();

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
    const url = date ? `${API_URL}/trips/route/${selectedRoute.id}?date=${date}` : `${API_URL}/trips/route/${selectedRoute.id}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => setTrips(data))
      .catch((err) => console.error("Failed to load trips:", err));
  }, [selectedRoute, date]);

  //for pickup and dropoff

  const handleRouteChange = (e) => {
    const routeId = Number(e.target.value);

    if (!routeId) {
      setSelectedRoute(null);
      setTrips([]);
      setSelectedTripId("");
      setStops([]);
      return;
    }

    const route = routes.find((r) => r.id === routeId);
    setSelectedRoute(route || null);
    setSelectedTripId("");
    setStops(route ? route.stops : []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoute || !selectedTripId || !pickup || !dropoff || !date) {
      alert("Fill in all required fields");
      return;
    }
    if (passengers > maxPassengers) {
      alert(`Number of passengers cannot exceed ${maxPassengers}`);
      return;
    }

    const payload = {
      tripId: selectedTripId,
      pickup,
      dropoff,
      date,
      returnDate: tripType === "round-trip" ? returnDate : null,
      tripType,
      seats: passengers,
    };

    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      setBookingRef(data.booking.booking_ref);//save qrcode
      if (res.ok) {
        alert(`Booking confirmed: ${data.booking.booking_ref}`);
        // Refetch trips to update available seats
        const url = date ? `${API_URL}/trips/route/${selectedRoute.id}?date=${date}` : `${API_URL}/trips/route/${selectedRoute.id}`;
        fetch(url)
          .then((res) => res.json())
          .then((data) => setTrips(data))
          .catch((err) => console.error("Failed to reload trips:", err));
      } else alert(data.message);
    } catch (err) {
      console.error("Booking failed:", err);
      
    }
  };

  const DownloadQRCode = () => {
    const canvas = qrRef.current.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL();
      const a = document.createElement('a');
      a.href = url;
      a.download = `booking-${bookingRef}.png`;
      a.click();
    }
  };

  return (
    <div className="container">
      <h1>Book Your Trip</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Route:
          <select value={selectedRoute?.id || ""} onChange={handleRouteChange}>
            <option value="">Select Route</option>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Trip:
          <select
            value={selectedTripId}
            onChange={(e) => {
              setSelectedTripId(e.target.value);
              const trip = trips.find(t => t.id == e.target.value);
              setMaxPassengers(trip ? (trip.available !== undefined ? trip.available : trip.capacity) : 0);
            }}
            disabled={!trips.length}
          >
            <option value="">Select Trip</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.departure_time} ({t.available !== undefined ? `${t.available} available` : `${t.capacity} seats`})
              </option>
            ))}
          </select>
        </label>

        <label>
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        {tripType === "round-trip" && (
          <label>
            Return Date:
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              required
            />
          </label>
        )}

        <label>
          Passengers:
          <input
            type="number"
            min="1"
            max={maxPassengers || 1}
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            placeholder="Number of passengers"
            required
          />
        </label>

        <label>
          Pickup:
          <select value={pickup} onChange={(e) => setPickup(e.target.value)}>
            <option value="">Select Pickup</option>
            {stops.map((stop, index) => (
              <option key={index} value={stop}>
                {stop}
              </option>
            ))}
          </select>
        </label>

        <label>
          Dropoff:
          <select value={dropoff} onChange={(e) => setDropoff(e.target.value)}>
            <option value="">Select Dropoff</option>
            {stops.map((stop, index) => (
              <option key={index} value={stop}>
                {stop}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend>Trip Type:</legend>
          <label>
            <input
              type="radio"
              value="one-way"
              checked={tripType === "one-way"}
              onChange={(e) => setTripType(e.target.value)}
            />
            One-way
          </label>
          <label>
            <input
              type="radio"
              value="round-trip"
              checked={tripType === "round-trip"}
              onChange={(e) => setTripType(e.target.value)}
            />
            Round-trip
          </label>
        </fieldset>

        <button type="submit">Book</button>
      </form>

      {bookingRef && (
        <div ref={qrRef}>
          <h2>Show QR Code when embarking</h2>
          <QRCode value={bookingRef} />
          <button onClick={DownloadQRCode}>Download QR Code</button>
        </div>
      )}
    </div>
  );
}

export default App;
