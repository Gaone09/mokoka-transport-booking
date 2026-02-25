import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (location.pathname === "/login") return null;

  const linkStyle = (path) => ({
    color: location.pathname === path ? "#e8c87d" : "#aaa",
    textDecoration: "none",
    fontSize: "13px",
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.05em",
    fontWeight: location.pathname === path ? "600" : "400",
    transition: "color 0.2s",
    borderBottom: location.pathname === path ? "1px solid #e8c87d" : "1px solid transparent",
    paddingBottom: "2px",
  });

  return (
    <nav style={{
      backgroundColor: "#0a0a0a",
      borderBottom: "1px solid #1e1e1e",
      padding: "0 2rem",
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/login" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
        <img src="/images/logo.svg" alt="Jones Coaches logo" style={{
          width: "32px", height: "32px",
          borderRadius: "6px",
          objectFit: "cover",
          display: "block"
        }}
        onError={e => {
          e.target.onerror = null;
          e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" rx="8" fill="%23c49a3c"/><text x="32" y="42" font-family="Playfair Display, serif" font-size="22" font-weight="700" text-anchor="middle" fill="%230a0a0a">JC</text></svg>';
        }} />
        <span style={{ width: 0, height: 0, overflow: 'hidden', position: 'absolute' }}>Jones Coaches</span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
        {token && <>
          <Link to="/" style={linkStyle("/")}>Book</Link>
          <Link to="/my-bookings" style={linkStyle("/my-bookings")}>My Trips</Link>
          <Link to="/find-booking" style={linkStyle("/find-booking")}>Find Booking</Link>
          {user?.role === "admin" && (
            <Link to="/admin/scanner" style={linkStyle("/admin/scanner")}>Scanner</Link>
          )}
          <button onClick={logout} style={{
            background: "transparent",
            border: "1px solid #333",
            color: "#888",
            padding: "6px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            fontFamily: "'DM Mono', monospace",
            letterSpacing: "0.05em",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.target.style.borderColor = "#e8c87d"; e.target.style.color = "#e8c87d"; }}
          onMouseLeave={e => { e.target.style.borderColor = "#333"; e.target.style.color = "#888"; }}
          >
            Logout
          </button>
        </>}
      </div>
    </nav>
  );
}
