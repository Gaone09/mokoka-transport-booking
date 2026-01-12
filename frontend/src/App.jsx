import { useState, useEffect } from "react";
import { fetchRoutes, createBooking } from "./api/booking"; // Correct path

function App() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [tripType, setTripType] = useState("one-way");
  const [date, setDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [error, setError] = useState(null);

  // Load routes from backend
  useEffect(() => {
    async function loadRoutes() {
      try {
        setLoadingRoutes(true);
        const data = await fetchRoutes();
        setRoutes(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load routes");
      } finally {
        setLoadingRoutes(false);
      }
    }
    loadRoutes();
  }, []);

  // Load trips when route changes
  useEffect(() => {
    if (!selectedRoute) {
      setTrips([]);
      setSelectedTrip("");
      return;
    }

    async function loadTrips() {
      try {
        setLoadingTrips(true);
        const res = await fetch(`/api/trips/route/${selectedRoute.id}`);
        if (!res.ok) throw new Error("Failed to load trips");
        const data = await res.json();
        setTrips(Array.isArray(data) ? data : []);
        setSelectedTrip("");
      } catch (err) {
        console.error(err);
        setTrips([]);
      } finally {
        setLoadingTrips(false);
      }
    }

    loadTrips();
  }, [selectedRoute]);

  const handleRouteChange = (e) => {
    const routeId = Number(e.target.value);
    const route = routes.find((r) => r.id === routeId) || null;
    setSelectedRoute(route);
    setPickup("");
    setDropoff("");
    setSelectedTrip("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRoute || !selectedTrip || !pickup || !dropoff || !date) {
      alert("Please fill in all required fields");
      return;
    }

    const payload = {
      routeId: selectedRoute.id,
      tripTime: selectedTrip,
      pickup,
      dropoff,
      date,
      returnDate: tripType === "round-trip" ? returnDate : null,
      tripType,
    };

    try {
      const data = await createBooking(payload);
      alert(`Booking confirmed: ${data.booking.bookingRef}`);
      // Reset form
      setSelectedRoute(null);
      setTrips([]);
      setSelectedTrip("");
      setPickup("");
      setDropoff("");
      setDate("");
      setReturnDate("");
      setTripType("one-way");
    } catch (err) {
      console.error(err);
      alert(err.message || "Booking failed");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Book Your Trip</h1>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Route */}
        <div className="mb-4">
          <label>Route:</label>
          <select
            value={selectedRoute?.id || ""}
            onChange={handleRouteChange}
            disabled={loadingRoutes}
          >
            <option value="">
              {loadingRoutes ? "Loading..." : "Select a route"}
            </option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.name}
              </option>
            ))}
          </select>
        </div>

        {/* Trip */}
        <div className="mb-4">
          <label>Trip Time:</label>
          <select
            value={selectedTrip}
            onChange={(e) => setSelectedTrip(e.target.value)}
            disabled={!selectedRoute || loadingTrips || trips.length === 0}
          >
            <option value="">
              {loadingTrips ? "Loading trips..." : "Select a trip"}
            </option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.departure_time}>
                {trip.departure_time} ({trip.capacity} seats)
              </option>
            ))}
          </select>
        </div>

        {/* Pickup */}
        <div className="mb-4">
          <label>Pickup:</label>
          <select
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
            disabled={!selectedRoute}
          >
            <option value="">Select pickup</option>
            {selectedRoute?.stops.map((stop) => (
              <option key={stop} value={stop}>
                {stop}
              </option>
            ))}
          </select>
        </div>

        {/* Dropoff */}
        <div className="mb-4">
          <label>Dropoff:</label>
          <select
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
            disabled={!pickup}
          >
            <option value="">Select dropoff</option>
            {selectedRoute?.stops
              .filter((stop) => stop !== pickup)
              .map((stop) => (
                <option key={stop} value={stop}>
                  {stop}
                </option>
              ))}
          </select>
        </div>

        {/* Date */}
        <div className="mb-4">
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        {/* Return Date */}
        {tripType === "round-trip" && (
          <div className="mb-4">
            <label>Return Date:</label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </div>
        )}

        {/* Trip Type */}
        <div className="mb-4">
          <label>Trip Type:</label>
          <div>
            <label>
              <input
                type="radio"
                value="one-way"
                checked={tripType === "one-way"}
                onChange={(e) => setTripType(e.target.value)}
              />
              One-way
            </label>
            <label className="ml-4">
              <input
                type="radio"
                value="round-trip"
                checked={tripType === "round-trip"}
                onChange={(e) => setTripType(e.target.value)}
              />
              Round-trip
            </label>
          </div>
        </div>

        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Book Trip
        </button>
      </form>
    </div>
  );
}

export default App;
