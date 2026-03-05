import { apiFetch } from "../api";
import { useState } from "react";



export default function FindBooking() {
  const [code, setCode] = useState("");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async () => {
    if (!code.trim()) { setError("Please enter a booking reference."); return; }
    setLoading(true);
    setError("");
    setBooking(null);
    try {
      const res = await apiFetch(`/api/bookings/${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Booking not found.");
        return;
      }
      setBooking(data);
    } catch {
      setError("Unable to search. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = { fontSize: "11px", color: "#555", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "4px" };
  const valueStyle = { fontSize: "14px", color: "#b8b5b5", fontFamily: "'DM Sans', sans-serif" };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#0a0a0a", padding: "48px 2rem" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        <div style={{ marginBottom: "36px" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.2em", color: "#e8c87d", textTransform: "uppercase", marginBottom: "10px" }}>Lookup</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", color: "#756c6c", margin: 0, fontWeight: "700" }}>Find Booking</h1>
        </div>

        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "32px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "11px", color: "#666", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Booking Reference
          </label>
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              placeholder="e.g. JC-ABC123"
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search()}
              style={{
                flex: 1,
                padding: "12px 16px",
                background: "#0a0a0a",
                border: "1px solid #2a2a2a",
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: "'DM Mono', monospace",
                color: "#ccb7b7",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#e8c87d"}
              onBlur={e => e.target.style.borderColor = "#2a2a2a"}
            />
            <button
              onClick={search}
              disabled={loading}
              style={{
                padding: "12px 24px",
                background: loading ? "#1e1e1e" : "linear-gradient(135deg, #e8c87d, #c49a3c)",
                border: "none",
                borderRadius: "8px",
                color: loading ? "#555" : "#0a0a0a",
                fontSize: "13px",
                fontFamily: "'DM Mono', monospace",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {loading ? "..." : "Search →"}
            </button>
          </div>

          {error && (
            <div style={{ marginTop: "16px", background: "rgba(220,53,69,0.1)", border: "1px solid rgba(220,53,69,0.3)", color: "#ff6b7a", padding: "12px 16px", borderRadius: "8px", fontSize: "13px", fontFamily: "'DM Mono', monospace" }}>
              ⚠ {error}
            </div>
          )}
        </div>

        {booking && (
          <div style={{ marginTop: "24px", background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "28px 32px" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#f0f0f0", fontWeight: "600", marginBottom: "20px" }}>
              {booking.route_name || "Booking Details"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div><span style={labelStyle}>Reference</span><span style={valueStyle}>{booking.booking_ref}</span></div>
              <div><span style={labelStyle}>Status</span><span style={{ ...valueStyle, color: booking.status === "CONFIRMED" ? "#5cb85c" : booking.status === "CANCELLED" ? "#ff6b7a" : "#ffc107" }}>{booking.status}</span></div>
              <div><span style={labelStyle}>Date</span><span style={valueStyle}>{booking.date || "—"}</span></div>
              <div><span style={labelStyle}>Seats</span><span style={valueStyle}>{booking.seats || 1}</span></div>
              <div><span style={labelStyle}>Pickup</span><span style={valueStyle}>{booking.pickup || "—"}</span></div>
              <div><span style={labelStyle}>Drop-off</span><span style={valueStyle}>{booking.dropoff || "—"}</span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}