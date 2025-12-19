import { useState } from "react";
import { routes } from "./data/routes";

function App() {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [date, setDate] = useState("");

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-primary text-white p-4 text-center font-semibold">
        Mokoka Transport
      </header>

      <main className="p-4 max-w-md mx-auto">
        <h1 className="text-lg font-bold mb-4">Book your trip</h1>

        {/* Route */}
        <select
          className="w-full p-3 mb-3 rounded-lg border"
          onChange={(e) => {
            const route = routes.find((r) => r.id === e.target.value);
            setSelectedRoute(route);
            setPickup("");
            setDropoff("");
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
            onChange={(e) => setPickup(e.target.value)}
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
            onChange={(e) => setDropoff(e.target.value)}
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
          onChange={(e) => setDate(e.target.value)}
        />

        <button
          className="w-full bg-accent text-white py-3 rounded-lg font-semibold"
          disabled={!pickup || !dropoff || !date}
        >
          Search trips
        </button>
      </main>
    </div>
  );
}

export default App;
