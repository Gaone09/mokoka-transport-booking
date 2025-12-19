import { useState } from "react";
import { routes } from "./data/routes";

function App() {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState("");
  const [showTrips, setShowTrips] = useState(false);

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
          }}
        >
          <option value="">Select route</option>
          {routes.map((route) => (
            <option key={route.id} value={route.id}>
              {route.name}
            </option>
          ))}
        </select>

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

        {/* Date */}
        <input
          type="date"
          className="w-full p-3 mb-4 rounded-lg border"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setShowTrips(false);
          }}
        />

        {/* Validation */}
        {!isValidSelection() && pickup && dropoff && (
          <p className="text-sm text-red-600 mb-3">
            Drop-off must come after pickup.
          </p>
        )}

        <button
          className="w-full bg-accent text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          disabled={!isValidSelection() || !date}
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

                <button className="mt-3 w-full bg-primary text-white py-2 rounded-lg">
                  Book this trip
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
