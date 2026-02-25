import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { emailValidator, passwordValidator } from "../components/regexValidator";
import { apiFetch } from "../api";

const inputStyle = {
  width: "100%", padding: "14px 18px", background: "#111",
  border: "1px solid #2a2a2a", borderRadius: "8px", fontSize: "14px",
  fontFamily: "'playfair display', serif", color: "#f0f0f0",
  boxSizing: "border-box", outline: "none", transition: "border-color 0.2s",
};

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);

    if (!emailValidator(form.email))      { setError("Please enter a valid email."); setLoading(false); return; }
    if (!passwordValidator(form.password)) { setError("Password must be 8 characters long with a number and special character."); setLoading(false); return; }
    if (mode === "register" && !form.name.trim()) { setError("Full name is required."); setLoading(false); return; }

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = mode === "login" ? { email: form.email, password: form.password } : form;

    try {
      const res = await apiFetch(endpoint, { method: "POST", body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Something went wrong,Try again."); return; }
      if (mode === "login") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        setSuccess(data.message || "Account created! You can now sign in.");
        setMode("login");
        setForm({ name: "", email: "", password: "" });
      }
    } catch { setError("Unable to connect. Check your connection."); }
    finally { setLoading(false); }
  };

  const tab = (m) => ({
    flex: 1, padding: "10px", border: "none", borderRadius: "6px", cursor: "pointer",
    fontSize: "12px", fontFamily: "'playfair display', serif", letterSpacing: "0.08em",
    textTransform: "uppercase", transition: "all 0.2s",
    background: mode === m ? "#1e1e1e" : "transparent",
    color: mode === m ? "#e8c87d" : "#555",
    fontWeight: mode === m ? "600" : "400",
  });

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      position: "relative",
      overflow: "hidden",
      backgroundColor: "#0a0a0a",
      backgroundImage: "linear-gradient(rgba(10,10,10,0.6), rgba(10,10,10,0.6)), url('/login-bg.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(180deg, rgba(10,10,10,0.35), rgba(10,10,10,0.6))" }} />

      <div style={{ width: "100%", maxWidth: "480px", background: "rgba(10,10,10,0.5)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "16px", padding: "48px 40px", boxShadow: "0 20px 48px rgba(2,6,23,0.7)", backdropFilter: "blur(8px)" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <img src="/logo.svg" alt="Jones Coaches" style={{ width: "140px", height: "auto", borderRadius: "12px", display: "inline-block", marginBottom: "12px", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }} />
          <p style={{ margin: "8px 0 0", color: "#bbb", fontSize: "13px", fontFamily: "'DM Mono',monospace", letterSpacing: "0.04em" }}>Luxury intercity travel</p>
        </div>

        <div style={{ display:"flex", background:"#0a0a0a", borderRadius:"8px", padding:"4px", marginBottom:"32px", border:"1px solid #1e1e1e" }}>
          {["login","register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }} style={tab(m)}>
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {error   && <div style={{ background:"rgba(220,53,69,0.1)", border:"1px solid rgba(220,53,69,0.3)", color:"#ff6b7a", padding:"12px 16px", borderRadius:"8px", marginBottom:"20px", fontSize:"13px", fontFamily:"'DM Mono',monospace", display:"flex", alignItems:"center", gap:"8px" }}>⚠ {error}</div>}
        {success && <div style={{ background:"rgba(40,167,69,0.1)",  border:"1px solid rgba(40,167,69,0.3)",  color:"#5cb85c",  padding:"12px 16px", borderRadius:"8px", marginBottom:"20px", fontSize:"13px", fontFamily:"'DM Mono',monospace", display:"flex", alignItems:"center", gap:"8px" }}>✓ {success}</div>}

        <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          {mode === "register" && (
            <div>
              <label style={{ display:"block", marginBottom:"8px", fontSize:"11px", color:"#666", fontFamily:"'DM Mono',monospace", letterSpacing:"0.08em", textTransform:"uppercase" }}>Full Name</label>
              <input type="text" placeholder="John Smith" value={form.name} onChange={e => setForm({...form,name:e.target.value})}
                style={{ ...inputStyle, borderColor: focusedField==="name"?"#e8c87d":"#2a2a2a" }}
                onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField(null)} />
            </div>
          )}
          <div>
            <label style={{ display:"block", marginBottom:"8px", fontSize:"11px", color:"#666", fontFamily:"'DM Mono',monospace", letterSpacing:"0.08em", textTransform:"uppercase" }}>Email</label>
            <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({...form,email:e.target.value})}
              style={{ ...inputStyle, borderColor: focusedField==="email"?"#e8c87d":"#2a2a2a" }}
              onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} />
          </div>
          <div>
            <label style={{ display:"block", marginBottom:"8px", fontSize:"11px", color:"#666", fontFamily:"'DM Mono',monospace", letterSpacing:"0.08em", textTransform:"uppercase" }}>Password</label>
            <input type="password" placeholder={mode==="register"?"Min 8 chars, 1 number, 1 special":"••••••••"} value={form.password} onChange={e => setForm({...form,password:e.target.value})}
              style={{ ...inputStyle, borderColor: focusedField==="password"?"#e8c87d":"#2a2a2a" }}
              onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)} />
          </div>
          <button type="submit" disabled={loading} style={{ marginTop:"8px", padding:"14px", background:loading?"#2a2a2a":"linear-gradient(135deg,#e8c87d,#c49a3c)", border:"none", borderRadius:"8px", color:loading?"#666":"#0a0a0a", fontSize:"13px", fontFamily:"'DM Mono',monospace", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase", cursor:loading?"not-allowed":"pointer", transition:"all 0.2s", boxShadow:loading?"none":"0 4px 16px rgba(232,200,125,0.3)" }}>
            {loading ? "Please wait..." : mode==="login" ? "Sign In →" : "Create Account →"}
          </button>
        </form>
      </div>
    </div>
  );
}