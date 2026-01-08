const API_BASE = "http://localhost:5000/api";

export async function fetchRoutes() {
  const res = await fetch(`${API_BASE}/routes`);
  return res.json();
}

export async function createBooking(payload) {
  const res = await fetch(`${API_BASE}/book`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Booking failed");
  }

  return res.json();
}
