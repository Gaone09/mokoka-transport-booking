import { apiFetch } from "../api";
// NOTE: Run `npm install react-qr-reader` to enable the QR scanner.
import { useState } from "react";
// Uncomment the line below after installing react-qr-reader:
// import { QrReader } from "react-qr-reader";



export default function AdminScanner() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [scanLoading, setScanLoading] = useState(false);
  const [manualRef, setManualRef] = useState("");
  const [scannerActive, setScannerActive] = useState(false);

  const processRef = async (ref) => {
    if (!ref) return;
    setScanLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await apiFetch('/api/admin/scan', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ bookingRef: ref }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid or already used booking reference.");
        return;
      }
      setResult(data);
    } catch {
      setError("Scan failed. Please check your connection and try again.");
    } finally {
      setScanLoading(false);
    }
  };

  // Uncomment when react-qr-reader is installed:
  // const handleScan = (scanResult) => {
  //   if (scanResult?.text && !scanLoading) processRef(scanResult.text);
  // };

  const labelStyle = { fontSize: "11px", color: "#555", fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: "4px" };
  const valueStyle = { fontSize: "14px", color: "#e0e0e0", fontFamily: "'DM Sans', sans-serif" };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#0a0a0a", padding: "48px 2rem" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        <div style={{ marginBottom: "36px" }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.2em", color: "#e8c87d", textTransform: "uppercase", marginBottom: "10px" }}>Admin Panel</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", color: "#f0f0f0", margin: 0, fontWeight: "700" }}>Ticket Scanner</h1>
        </div>

        {/* QR Scanner panel */}
        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "28px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", color: "#aaa" }}>QR Camera Scanner</span>
            <button
              onClick={() => setScannerActive(a => !a)}
              style={{
                padding: "8px 18px",
                background: scannerActive ? "rgba(220,53,69,0.15)" : "rgba(232,200,125,0.1)",
                border: `1px solid ${scannerActive ? "rgba(220,53,69,0.4)" : "rgba(232,200,125,0.3)"}`,
                borderRadius: "6px",
                color: scannerActive ? "#ff6b7a" : "#e8c87d",
                fontFamily: "'DM Mono', monospace",
                fontSize: "11px",
                letterSpacing: "0.06em",
                cursor: "pointer",
              }}
            >
              {scannerActive ? "Stop Scanner" : "Start Scanner"}
            </button>
          </div>

          {scannerActive ? (
            <div style={{ borderRadius: "10px", overflow: "hidden", background: "#0a0a0a", border: "1px solid #2a2a2a" }}>
              {/* 
                Uncomment the QrReader below after running: npm install react-qr-reader
                <QrReader
                  onResult={handleScan}
                  constraints={{ facingMode: "environment" }}
                  style={{ width: "100%" }}
                />
              */}
              <div style={{ height: "220px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "40px" }}>📷</span>
                <p style={{ color: "#555", fontFamily: "'DM Mono', monospace", fontSize: "12px", textAlign: "center", margin: 0 }}>
                  Install react-qr-reader to enable camera scanning.<br />
                  <code style={{ color: "#e8c87d" }}>npm install react-qr-reader</code>
                </p>
              </div>
            </div>
          ) : (
            <div style={{ height: "140px", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a", borderRadius: "10px", border: "1px dashed #2a2a2a" }}>
              <span style={{ color: "#333", fontFamily: "'DM Mono', monospace", fontSize: "12px" }}>Camera inactive</span>
            </div>
          )}
        </div>

        {/* Manual entry */}
        <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "28px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "11px", color: "#666", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Manual Reference Entry
          </label>
          <div style={{ display: "flex", gap: "12px" }}>
            <input
              placeholder="Enter booking ref..."
              value={manualRef}
              onChange={e => setManualRef(e.target.value)}
              onKeyDown={e => e.key === "Enter" && processRef(manualRef.trim())}
              style={{
                flex: 1, padding: "12px 16px",
                background: "#0a0a0a", border: "1px solid #2a2a2a", borderRadius: "8px",
                fontSize: "14px", fontFamily: "'DM Mono', monospace", color: "#f0f0f0",
                outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#e8c87d"}
              onBlur={e => e.target.style.borderColor = "#2a2a2a"}
            />
            <button
              onClick={() => processRef(manualRef.trim())}
              disabled={scanLoading}
              style={{
                padding: "12px 20px",
                background: scanLoading ? "#1e1e1e" : "linear-gradient(135deg, #e8c87d, #c49a3c)",
                border: "none", borderRadius: "8px",
                color: scanLoading ? "#555" : "#0a0a0a",
                fontFamily: "'DM Mono', monospace", fontWeight: "700", fontSize: "12px",
                cursor: scanLoading ? "not-allowed" : "pointer", whiteSpace: "nowrap",
              }}
            >
              {scanLoading ? "..." : "Validate"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginTop: "20px", background: "rgba(220,53,69,0.1)", border: "1px solid rgba(220,53,69,0.3)", color: "#ff6b7a", padding: "14px 18px", borderRadius: "10px", fontSize: "13px", fontFamily: "'DM Mono', monospace" }}>
            ⚠ {error}
          </div>
        )}

        {/* Success result */}
        {result && (
          <div style={{ marginTop: "20px", background: "rgba(40,167,69,0.08)", border: "1px solid rgba(40,167,69,0.3)", borderRadius: "14px", padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span style={{ fontSize: "24px" }}>✅</span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#5cb85c", fontWeight: "600" }}>Ticket Validated</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {result.booking_ref && <div><span style={labelStyle}>Reference</span><span style={valueStyle}>{result.booking_ref}</span></div>}
              {result.passenger_name && <div><span style={labelStyle}>Passenger</span><span style={valueStyle}>{result.passenger_name}</span></div>}
              {result.route_name && <div><span style={labelStyle}>Route</span><span style={valueStyle}>{result.route_name}</span></div>}
              {result.seats && <div><span style={labelStyle}>Seats</span><span style={valueStyle}>{result.seats}</span></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}