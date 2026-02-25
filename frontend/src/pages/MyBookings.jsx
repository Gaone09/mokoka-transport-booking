import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

function MyBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/bookings/my`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(() => setBookings([]));
  }, []);

  const cancelBooking = async (ref) => {
    if (!confirm("Cancel this booking?")) return;

    await fetch(`${API_URL}/bookings/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingRef: ref }),
    });

    setBookings(b =>
      b.map(x =>
        x.booking_ref === ref ? { ...x, status: "CANCELLED" } : x
      )
    );
  };

  return (
    <div>
      <h2>My Bookings</h2>

      {bookings.map(b => (
        <div key={b.booking_ref} style={{ border: "1px solid #ccc", padding: 12, marginBottom: 10 }}>
          <p><b>Route:</b> {b.route_name}</p>
          <p><b>Date:</b> {b.date}</p>
          <p><b>Status:</b> {b.status}</p>
          <p><b>Ref:</b> {b.booking_ref}</p>

          {b.status === "CONFIRMED" && (
            <button onClick={() => cancelBooking(b.booking_ref)}>
              Cancel
            </button>
          )}
        </div>
      ))}
    </div>

  );
<button
  disabled={b.payment_status === "paid"}
  onClick={async () => {
    await fetch(`${API_URL}/bookings/${b.id}/pay`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    window.location.reload();
  }}
>
  {b.payment_status === "paid" ? "Paid" : "Pay Now"}
</button>


}

export default MyBookings;
