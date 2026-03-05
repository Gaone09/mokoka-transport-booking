import { apiFetch } from "../api";
import { useEffect, useState } from "react";



const STATUS_STYLES = {
  CONFIRMED: { bg: "rgba(40,167,69,0.1)", border: "rgba(40,167,69,0.3)", color: "#5cb85c" },
  CANCELLED: { bg: "rgba(220,53,69,0.1)", border: "rgba(220,53,69,0.3)", color: "#ff6b7a" },
  PENDING:   { bg: "rgba(255,193,7,0.1)",  border: "rgba(255,193,7,0.3)",  color: "#ffc107" },
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    apiFetch("/api/bookings/my", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setBookings(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load bookings.");
        setLoading(false);
      });
  }, [token]);

  const cancelBooking = async (ref) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setActionLoading(ref);
    try {
      const res = await apiFetch("/api/bookings/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingRef: ref }),
      });
      if (!res.ok) throw new Error();
      setBookings(b => b.map(x => x.booking_ref === ref ? { ...x, status: "CANCELLED" } : x));
    } catch {
      setError("Failed to cancel booking. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const payBooking = async (bookingId, ref) => {
    setActionLoading(ref);
    try {
      const res = await apiFetch(`/api/bookings/${bookingId}/pay`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setBookings(b => b.map(x => x.id === bookingId ? { ...x, payment_status: "paid" } : x));
    } catch {
      setError("Payment failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const labelStyle = { fontSize: "11px", color: "#555", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "4px" };
  const valueStyle = { fontSize: "14px", color: "#e0e0e0", fontFamily: "'DM Sans', sans-serif" };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#0a0a0a", padding: "48px 2rem" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <div style={{ marginBottom: "36px" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.2em", color: "#e8c87d", textTransform: "uppercase", marginBottom: "10px" }}>Account</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", color: "#f0f0f0", margin: 0, fontWeight: "700" }}>My Trips</h1>
        </div>

        {error && (
          <div style={{ background: "rgba(220,53,69,0.1)", border: "1px solid rgba(220,53,69,0.3)", color: "#ff6b7a", padding: "14px 18px", borderRadius: "8px", marginBottom: "24px", fontSize: "13px", fontFamily: "'DM Mono', monospace" }}>
            ⚠ {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "13px" }}>
            Loading your bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div style={{
            background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px",
            padding: "60px 40px", textAlign: "center",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎫</div>
            <p style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "14px" }}>No bookings yet. Book your first journey!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {bookings.map(b => {
              const s = STATUS_STYLES[b.status] || STATUS_STYLES.PENDING;
              const isLoading = actionLoading === b.booking_ref || actionLoading === b.booking_ref;
              return (
                <div key={b.booking_ref} style={{
                  background: "#111",
                  border: "1px solid #1e1e1e",
                  borderRadius: "14px",
                  padding: "24px 28px",
                  transition: "border-color 0.2s",
                }}>
                  {/* Header row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#f0f0f0", fontWeight: "600", marginBottom: "4px" }}>
                        {b.route_name || "Journey"}
                      </div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "#555", letterSpacing: "0.08em" }}>
                        REF: {b.booking_ref}
                      </div>
                    </div>
                    <span style={{
                      padding: "5px 14px",
                      background: s.bg,
                      border: `1px solid ${s.border}`,
                      borderRadius: "100px",
                      color: s.color,
                      fontSize: "11px",
                      fontFamily: "'DM Mono', monospace",
                      letterSpacing: "0.06em",
                      fontWeight: "600",
                      textTransform: "uppercase",
                    }}>{b.status}</span>
                  </div>

                  {/* Details grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                    <div><span style={labelStyle}>Date</span><span style={valueStyle}>{b.date || "—"}</span></div>
                    <div><span style={labelStyle}>Seats</span><span style={valueStyle}>{b.seats || 1}</span></div>
                    <div><span style={labelStyle}>Pickup</span><span style={valueStyle}>{b.pickup || "—"}</span></div>
                    <div><span style={labelStyle}>Drop-off</span><span style={valueStyle}>{b.dropoff || "—"}</span></div>
                    <div>
                      <span style={labelStyle}>Payment</span>
                      <span style={{ ...valueStyle, color: b.payment_status === "paid" ? "#5cb85c" : "#ffc107" }}>
                        {b.payment_status === "paid" ? "✓ Paid" : "Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {b.status !== "CANCELLED" && (
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {b.payment_status !== "paid" && (
                        <button
                          disabled={isLoading}
                          onClick={() => payBooking(b.id, b.booking_ref)}
                          style={{
                            padding: "10px 20px",
                            background: "linear-gradient(135deg, #e8c87d, #c49a3c)",
                            border: "none",
                            borderRadius: "8px",
                            color: "#0a0a0a",
                            fontSize: "12px",
                            fontFamily: "'DM Mono', monospace",
                            fontWeight: "700",
                            letterSpacing: "0.06em",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            opacity: isLoading ? 0.6 : 1,
                          }}
                        >
                          {isLoading ? "Processing..." : "Pay Now"}
                        </button>
                      )}
                      {b.status === "CONFIRMED" && (
                        <button
                          disabled={isLoading}
                          onClick={() => cancelBooking(b.booking_ref)}
                          style={{
                            padding: "10px 20px",
                            background: "transparent",
                            border: "1px solid #333",
                            borderRadius: "8px",
                            color: "#888",
                            fontSize: "12px",
                            fontFamily: "'DM Mono', monospace",
                            letterSpacing: "0.06em",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            opacity: isLoading ? 0.6 : 1,
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={e => { e.target.style.borderColor = "#ff6b7a"; e.target.style.color = "#ff6b7a"; }}
                          onMouseLeave={e => { e.target.style.borderColor = "#333"; e.target.style.color = "#888"; }}
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}