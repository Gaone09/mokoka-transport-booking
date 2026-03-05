import { useState, useEffect } from "react";
import { onAuthChange } from "./auth";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import MyBookings from "./pages/MyBookings";
import FindBooking from "./pages/FindBooking";
import AdminScanner from "./pages/AdminScanner";
import Navbar from "./components/Navbar";

function useAuth() {
  const [auth, setAuth] = useState(!!localStorage.getItem("token"));
  useEffect(() => {
    return onAuthChange(() => setAuth(!!localStorage.getItem("token")));
  }, []);
  return auth;
}

const PrivateRoute = ({ children }) => {
  const auth = useAuth();
  return auth ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const auth = useAuth();
  const user = (() => { try { return JSON.parse(localStorage.getItem("user")||"{}"); } catch { return {}; } })();
  if (!auth) return <Navigate to="/login" replace />;
  return user?.role === "admin" ? children : <Navigate to="/home" replace />;
};

export default function App() {
  const auth = useAuth();
  return (
    <Router>
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:"#0c0c0c" }}>
        <Navbar />
        <main style={{ flex:1 }}>
          <Routes>
            <Route path="/"              element={<Navigate to={auth ? "/home" : "/login"} replace />} />
            <Route path="/login"         element={auth ? <Navigate to="/home" replace /> : <Login />} />
            <Route path="/home"          element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/my-bookings"   element={<PrivateRoute><MyBookings /></PrivateRoute>} />
            <Route path="/find-booking"  element={<FindBooking />} />
            <Route path="/admin/scanner" element={<AdminRoute><AdminScanner /></AdminRoute>} />
            <Route path="*"              element={<Navigate to={auth ? "/home" : "/login"} replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}