import { useEffect, useState } from "react";
import { fetchRoutes, createBooking } from "./api/booking";

function App() {
  const [tripType, setTripType] = useState("one-way");
  const [returnDate, setReturnDate] = useState("");

  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [error, setError] = useState("");

  const [selectedRoute, setSelectedRoute] = useState(null);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState("");
  const [showTrips, setShowTrips] = useState(false);

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [seatCount, setSeatCount] = useState(1);
  const [bookingRef, setBookingRef] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const generateBookingRef = () => {
    const routeCode = selectedRoute.id;
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `MK-${routeCode}-${random}`;
  };
  useEffect(() => {
    fetchRoutes()
      .then((data) => setRoutes(data))
      .catch(() => setError("Failed to load routes"))
      .finally(() => setLoadingRoutes(false));
  }, []);

  const isValidSelection = () => {
    if (!selectedRoute) return false;
    if (!pickup || !dropoff || pickup === dropoff) return false;

    const pickupIndex = selectedRoute.stops.indexOf(pickup);
    const dropoffIndex = selectedRoute.stops.indexOf(dropoff);

    return dropoffIndex > pickupIndex;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-primary text-white p-4 text-center font-semibold">
        Mokoka Transport
      </header>

      <main className="p-4 max-w-md mx-auto">
        <h1 className="text-lg font-bold mb-4">Book your trip with us</h1>

        {/* Route */}
        <select
          className="w-full p-3 mb-3 rounded-lg border"
          onChange={(e) => {
            const route = routes.find((r) => r.id === e.target.value);
            setSelectedRoute(route);
            setPickup("");
            setDropoff("");
            setShowTrips(false);
            setSelectedTrip(null);
            setConfirmed(false);
          }}
        >
          <option value="">Select route</option>
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.name}
            </option>
          ))}
        </select>

        {/* Trip Type */}
        <div className="mb-4">
          <p className="font-medium mb-2">Trip Type</p>
          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="tripType"
                value="one-way"
                checked={tripType === "one-way"}
                onChange={() => {
                  setTripType("one-way");
                  setReturnDate("");
                }}
              />
              One way
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="tripType"
                value="round-trip"
                checked={tripType === "round-trip"}
                onChange={() => setTripType("round-trip")}
              />
              Round trip
            </label>
          </div>
        </div>

        {/* Pickup */}
        {selectedRoute && (
          <select
            className="w-full p-3 mb-3 rounded-lg border"
            value={pickup}
            onChange={(e) => {
              setPickup(e.target.value);
              setShowTrips(false);
            }}
          >
            <option value="">Pickup stop</option>
            {selectedRoute.stops.map((stop) => (
              <option key={stop} value={stop}>
                {stop}
              </option>
            ))}
          </select>
        )}

        {/* Drop-off */}
        {selectedRoute && (
          <select
            className="w-full p-3 mb-3 rounded-lg border"
            value={dropoff}
            onChange={(e) => {
              setDropoff(e.target.value);
              setShowTrips(false);
            }}
          >
            <option value="">Drop-off stop</option>
            {selectedRoute.stops.map((stop) => (
              <option key={stop} value={stop}>
                {stop}
              </option>
            ))}
          </select>
        )}

        {/* Departure Date */}
        <input
          type="date"
          className="w-full p-3 mb-3 rounded-lg border"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setShowTrips(false);
          }}
        />

        {/* Return Date (Round Trip Only) */}
        {tripType === "round-trip" && (
          <input
            type="date"
            className="w-full p-3 mb-4 rounded-lg border"
            value={returnDate}
            min={date}
            onChange={(e) => {
              setReturnDate(e.target.value);
              setShowTrips(false);
            }}
          />
        )}

        {/* Validation */}
        {!isValidSelection() && pickup && dropoff && (
          <p className="text-sm text-red-600 mb-3">
            Drop-off must come after pickup.
          </p>
        )}

        {/* Search Button */}
        <button
          className="w-full bg-accent text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          disabled={
            !isValidSelection() ||
            !date ||
            (tripType === "round-trip" && !returnDate)
          }
          onClick={() => setShowTrips(true)}
        >
          Search trips
        </button>

        {/* Trip Results */}
        {showTrips && (
          <div className="mt-6">
            <h2 className="font-semibold mb-3">Available trips</h2>

            {selectedRoute.trips.map((trip) => (
              <div
                key={trip.time}
                className="bg-white p-4 mb-3 rounded-lg shadow"
              >
                <p className="font-semibold">{selectedRoute.name}</p>
                <p className="text-sm text-gray-600">
                  {pickup} → {dropoff}
                </p>
                <p className="text-sm text-gray-600">Departure: {trip.time}</p>
                <p className="text-sm text-gray-600">
                  Seats available: {trip.capacity}
                </p>

                <button
                  className="mt-3 w-full bg-primary text-white py-2 rounded-lg"
                  onClick={() => {
                    setSelectedTrip(trip);
                    setSeatCount(1);
                    setConfirmed(false);
                  }}
                >
                  Book this trip
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Seat Selection */}
        {selectedTrip && !confirmed && (
          <div className="mt-6 bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold mb-3">Passenger details</h2>

            <p className="text-sm text-gray-600 mb-2">
              {selectedRoute.name} — {selectedTrip.time}
            </p>

            <label className="block mb-2 text-sm font-medium">
              Number of seats
            </label>

            <select
              className="w-full p-3 mb-4 rounded-lg border"
              value={seatCount}
              onChange={(e) => setSeatCount(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n} disabled={n > selectedTrip.capacity}>
                  {n}
                </option>
              ))}
            </select>

            <button
              className="w-full bg-accent text-white py-3 rounded-lg font-semibold"
              onClick={() => {
                if (seatCount > selectedTrip.capacity) return;
                setBookingRef(generateBookingRef());
                setConfirmed(true);
              }}
            >
              Confirm booking
            </button>
          </div>
        )}

        {/* Confirmation */}
        {confirmed && (
          <div className="mt-6 bg-green-50 border border-green-300 p-4 rounded-lg">
            <h2 className="font-bold text-green-700 mb-2">Booking confirmed</h2>
            <p className="text-sm">
              Booking reference: <strong>{bookingRef}</strong>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
