import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { notifyAuthChange, onAuthChange } from "../auth";

const BusIcon = ({ size=22, color="#fff" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={size} height={size} fill={color}>
    <rect x="10" y="8"  width="80" height="55" rx="12"/>
    <rect x="14" y="12" width="72" height="30" rx="4" fill="rgba(0,0,0,0.3)"/>
    <rect x="10" y="58" width="80" height="18" rx="4"/>
    <circle cx="25" cy="82" r="10"/>
    <circle cx="75" cy="82" r="10"/>
    <circle cx="25" cy="82" r="5" fill="rgba(0,0,0,0.4)"/>
    <circle cx="75" cy="82" r="5" fill="rgba(0,0,0,0.4)"/>
    <rect x="30" y="63" width="18" height="8" rx="2" fill="rgba(0,0,0,0.3)"/>
    <rect x="52" y="63" width="18" height="8" rx="2" fill="rgba(0,0,0,0.3)"/>
    <rect x="44" y="60" width="12" height="14" rx="2" fill="rgba(0,0,0,0.3)"/>
    <rect x="5"  y="20" width="6"  height="20" rx="3"/>
    <rect x="89" y="20" width="6"  height="20" rx="3"/>
  </svg>
);

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Reactive auth — updates instantly on login/logout
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  });

  useEffect(() => {
    return onAuthChange(() => {
      setToken(localStorage.getItem("token"));
      try { setUser(JSON.parse(localStorage.getItem("user") || "{}")); }
      catch { setUser({}); }
    });
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    notifyAuthChange();
    navigate("/login");
  };

  // Hide navbar on login page
  if (location.pathname === "/login") return null;

  const active = (p) => location.pathname === p;

  const links = [
    ["/home",         "Book a Trip"],
    ["/my-bookings",  "My Trips"],
    ["/find-booking", "Find Booking"],
    ...(user?.role === "admin" ? [["/admin/scanner","Scanner"]] : []),
  ];

  const linkStyle = (to) => ({
    padding: "8px 14px",
    borderRadius: 6,
    textDecoration: "none",
    fontSize: 13,
    fontWeight: active(to) ? 600 : 400,
    fontFamily: "Georgia, serif",
    color: active(to) ? "#e8c87d" : "#aaa",
    background: active(to) ? "rgba(180,148,80,0.08)" : "transparent",
    borderBottom: active(to) ? "2px solid #e8c87d" : "2px solid transparent",
    transition: "all 0.15s",
    display: "block",
  });

  return (
    <>
      <style>{`
        .jc-nav-link:hover { color: #e8c87d !important; background: rgba(180,148,80,0.06) !important; }
        .jc-signout:hover  { border-color: rgba(180,148,80,0.5) !important; color: #e8c87d !important; }
        .jc-hamburger span {
          display: block; width: 22px; height: 2px;
          background: #aaa; border-radius: 2px; transition: all 0.25s;
        }
        @media (max-width: 640px) {
          .jc-desktop-links { display: none !important; }
          .jc-hamburger      { display: flex !important; }
        }
        @media (min-width: 641px) {
          .jc-mobile-menu { display: none !important; }
          .jc-hamburger   { display: none !important; }
        }
      `}</style>

      <nav style={{
        background: "#0a0a0a",
        borderBottom: "1px solid #1e1e1e",
        padding: "0 1.5rem",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 1px 16px rgba(0,0,0,0.4)",
      }}>

        {/* Brand */}
        <Link to="/home" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:38, height:38, borderRadius:8,
            background:"linear-gradient(135deg,#c4a24a,#8a6c2c)",
            display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 2px 10px rgba(180,148,80,0.35)", flexShrink:0,
          }}>
            <BusIcon size={22} color="#fff"/>
          </div>
          <div>
            <div style={{
              fontFamily:"Georgia,'Times New Roman',serif",
              fontSize:16, fontWeight:700, color:"#f0ebe0",
              letterSpacing:"0.04em", lineHeight:1,
            }}>Jones Coaches</div>
            <div style={{
              fontSize:8, color:"rgba(180,148,80,0.55)",
              fontFamily:"'Courier New',monospace",
              letterSpacing:"0.2em", textTransform:"uppercase", marginTop:3,
            }}>Elite Intercity Transport</div>
          </div>
        </Link>

        {/* Desktop links */}
        {token && (
          <div className="jc-desktop-links" style={{ display:"flex", alignItems:"center", gap:4 }}>
            {links.map(([to, label]) => (
              <Link key={to} to={to} className="jc-nav-link" style={linkStyle(to)}>{label}</Link>
            ))}

            <div style={{ width:1, height:22, background:"#2a2a2a", margin:"0 8px" }}/>

            {/* Avatar */}
            <div style={{
              width:32, height:32, borderRadius:"50%",
              background:"linear-gradient(135deg,#c4a24a,#8a6c2c)",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontSize:13, fontWeight:700,
              fontFamily:"Georgia,serif",
              boxShadow:"0 2px 8px rgba(180,148,80,0.3)",
              flexShrink:0,
            }}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>

            <button onClick={logout} className="jc-signout" style={{
              padding:"7px 16px", background:"transparent",
              border:"1px solid #333", borderRadius:6,
              color:"#888", fontSize:12, fontFamily:"Georgia,serif",
              cursor:"pointer", transition:"all 0.15s", letterSpacing:"0.03em",
            }}>
              Sign Out
            </button>
          </div>
        )}

        {/* Hamburger — mobile only */}
        {token && (
          <button
            className="jc-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            style={{
              display:"none", flexDirection:"column", gap:5,
              background:"none", border:"none", cursor:"pointer", padding:4,
            }}>
            <span style={{ transform: menuOpen ? "rotate(45deg) translate(5px,5px)" : "none" }}/>
            <span style={{ opacity: menuOpen ? 0 : 1 }}/>
            <span style={{ transform: menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }}/>
          </button>
        )}
      </nav>

      {/* Mobile dropdown menu */}
      {token && menuOpen && (
        <div className="jc-mobile-menu" style={{
          position:"fixed", top:64, left:0, right:0, zIndex:99,
          background:"#0e0e0a", borderBottom:"1px solid #2a2418",
          padding:"1rem 1.5rem",
          boxShadow:"0 8px 24px rgba(0,0,0,0.5)",
        }}>
          {links.map(([to, label]) => (
            <Link key={to} to={to} className="jc-nav-link" style={{
              ...linkStyle(to),
              padding:"12px 8px",
              borderBottom: active(to) ? "none" : "none",
              borderLeft: active(to) ? "3px solid #e8c87d" : "3px solid transparent",
              paddingLeft:12, marginBottom:4,
            }}>{label}</Link>
          ))}

          <div style={{ borderTop:"1px solid #2a2418", marginTop:12, paddingTop:12,
            display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{
                width:32, height:32, borderRadius:"50%",
                background:"linear-gradient(135deg,#c4a24a,#8a6c2c)",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"#fff", fontSize:13, fontWeight:700,
              }}>
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <span style={{ color:"#c8b99a", fontSize:13, fontFamily:"Georgia,serif" }}>
                {user?.name || "Account"}
              </span>
            </div>
            <button onClick={logout} style={{
              padding:"8px 18px", background:"transparent",
              border:"1px solid #3a2e18", borderRadius:6,
              color:"rgba(180,148,80,0.7)", fontSize:13,
              fontFamily:"Georgia,serif", cursor:"pointer",
            }}>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}