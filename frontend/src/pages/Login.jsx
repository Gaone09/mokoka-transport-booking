import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { notifyAuthChange } from "../auth";
import { apiFetch } from "../api";

const BUS_IMG = "data:image/webp;base64,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";

const emailOk    = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const passwordOk = (v) => v.length >= 8 && /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v);

function pwStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw))  s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}
const S_COLOR = ["#e74c3c","#e67e22","#f0c030","#27ae60"];
const S_LABEL = ["Too short","Fair","Good","Strong"];
const CITIES  = ["Gaborone","Francistown","Maun","Palapye","Serowe","Lobatse","Kasane",
                 "Mahalapye","Molepolole","Kanye","Jwaneng","Selebi-Phikwe","Orapa",
                 "Letlhakane","Ramotswa","Tlokweng","Mogoditshane"];

const G = {
  root:{ minHeight:"100vh", display:"flex", fontFamily:"Georgia, 'Times New Roman', serif", background:"#0a0a0a" },
  left:{ flex:"1 1 55%", position:"relative", overflow:"hidden",
         display:"flex", flexDirection:"column", justifyContent:"flex-end" },
  busBg:{ position:"absolute", inset:0, backgroundSize:"cover",
          backgroundPosition:"center 60%", filter:"brightness(0.5) saturate(1.1)" },
  busOverlay:{ position:"absolute", inset:0,
    background:"linear-gradient(to right, rgba(5,8,10,0.3) 0%, rgba(5,8,10,0.1) 50%, rgba(5,8,10,0.75) 100%)" },
  leftContent:{ position:"relative", zIndex:2, padding:"3rem" },
  logoBadge:{ display:"inline-flex", alignItems:"center", gap:14,
    background:"rgba(5,8,10,0.65)", border:"1px solid rgba(180,148,80,0.3)",
    borderRadius:6, padding:"12px 18px", backdropFilter:"blur(12px)", marginBottom:"2.5rem" },
  logoImg:{ width:46, height:46, borderRadius:4, objectFit:"cover",
            border:"1px solid rgba(180,148,80,0.4)" },
  logoName:{ display:"block", fontFamily:"Georgia, serif", fontSize:"1.15rem",
             fontWeight:400, letterSpacing:"0.14em", color:"#f0e8d0",
             textTransform:"uppercase", lineHeight:1, marginBottom:3 },
  logoSub:{ display:"block", fontFamily:"'Courier New', monospace", fontSize:"9px",
            color:"rgba(180,148,80,0.55)", letterSpacing:"0.22em", textTransform:"uppercase" },
  tagline:{ fontFamily:"Georgia, serif", fontSize:"clamp(2rem,3vw,3rem)", fontWeight:400,
            color:"rgba(255,255,255,0.92)", lineHeight:1.2, margin:0,
            textShadow:"0 2px 24px rgba(0,0,0,0.6)" },
  taglineEm:{ fontStyle:"italic", color:"rgba(180,148,80,0.88)" },
  taglineSub:{ marginTop:10, fontSize:14, fontFamily:"Arial, sans-serif",
               fontWeight:300, color:"rgba(255,255,255,0.4)", letterSpacing:"0.06em" },
  right:{ width:460, flexShrink:0, background:"#ffffff",
          display:"flex", flexDirection:"column", justifyContent:"center",
          padding:"3rem 2.75rem", position:"relative", overflowY:"auto", minHeight:"100vh" },
  rightAccent:{ position:"absolute", top:0, left:0, width:3, height:"100%",
    background:"linear-gradient(180deg,transparent,rgba(180,148,80,0.5),transparent)" },
  formHdr:{ marginBottom:"1.75rem" },
  welcome:{ fontFamily:"Georgia, serif", fontSize:"1.75rem", fontWeight:400,
            color:"#1a120a", margin:"0 0 6px", lineHeight:1.2 },
  hint:{ fontSize:15, color:"#888", fontFamily:"Arial, sans-serif", fontWeight:400 },
  tabs:{ display:"flex", background:"#f4f4f4", borderRadius:8,
         padding:4, marginBottom:"1.5rem", gap:4 },
  tab:{ flex:1, padding:"11px 0", border:"none", borderRadius:6, background:"transparent",
        fontFamily:"Arial, sans-serif", fontSize:14, fontWeight:700,
        letterSpacing:"0.03em", color:"#999", cursor:"pointer", transition:"all 0.2s" },
  tabActive:{ background:"#fff", color:"#1a120a", boxShadow:"0 1px 6px rgba(0,0,0,0.1)" },
  field:{ marginBottom:"1rem" },
  label:{ display:"block", fontSize:12, fontWeight:700, letterSpacing:"0.05em",
          color:"#444", marginBottom:7, textTransform:"uppercase", fontFamily:"Arial, sans-serif" },
  input:{ width:"100%", padding:"14px 16px", background:"#fafafa",
          border:"1.5px solid #e0e0e0", borderRadius:7,
          fontFamily:"Arial, sans-serif", fontSize:16, color:"#1a1a1a",
          outline:"none", transition:"all 0.2s", boxSizing:"border-box", WebkitAppearance:"none" },
  inputFocus:{ borderColor:"#b49450", background:"#fff", boxShadow:"0 0 0 3px rgba(180,148,80,0.12)" },
  row2:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:"1rem" },
  phoneWrap:{ display:"flex", gap:8 },
  phoneCode:{ width:88, flexShrink:0, padding:"14px 10px", background:"#fafafa",
              border:"1.5px solid #e0e0e0", borderRadius:7,
              fontFamily:"Arial, sans-serif", fontSize:14, color:"#1a1a1a",
              outline:"none", WebkitAppearance:"none", cursor:"pointer" },
  strengthBar:{ display:"flex", gap:4, marginTop:7 },
  strengthSeg:{ height:3, flex:1, borderRadius:2, background:"#eee", transition:"background 0.3s" },
  strengthLbl:{ fontSize:11, color:"#aaa", marginTop:3, fontFamily:"Arial,sans-serif" },
  btn:{ width:"100%", padding:"16px", marginTop:"0.5rem",
        background:"linear-gradient(135deg,#c4a24a,#96762c)",
        border:"none", borderRadius:7, fontFamily:"Arial, sans-serif", fontSize:16, fontWeight:700,
        letterSpacing:"0.04em", color:"#fff", cursor:"pointer", transition:"all 0.25s",
        boxShadow:"0 4px 18px rgba(180,148,80,0.3)" },
  btnDisabled:{ background:"#e8e8e8", color:"#bbb", cursor:"not-allowed", boxShadow:"none" },
  err:{ padding:"13px 16px", background:"#fff5f5", border:"1.5px solid #fcc",
        borderRadius:7, fontSize:14, color:"#c0392b", marginBottom:"1.25rem",
        fontFamily:"Arial,sans-serif", display:"flex", alignItems:"center", gap:8 },
  ok:{ padding:"13px 16px", background:"#f0fff4", border:"1.5px solid #b2dfdb",
       borderRadius:7, fontSize:14, color:"#27ae60", marginBottom:"1.25rem",
       fontFamily:"Arial,sans-serif", display:"flex", alignItems:"center", gap:8 },
  checkRow:{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:"1rem" },
  checkLbl:{ fontSize:13, color:"#888", lineHeight:1.55, fontFamily:"Arial,sans-serif" },
  forgot:{ display:"block", textAlign:"center", marginTop:"1.25rem",
           fontSize:14, color:"#b49450", textDecoration:"none",
           fontWeight:700, fontFamily:"Arial,sans-serif" },
  pwHdr:{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 },
  pwToggle:{ fontSize:12, fontWeight:700, color:"#b49450", background:"none",
             border:"none", cursor:"pointer", padding:0, fontFamily:"Arial,sans-serif" },
  matchErr:{ fontSize:12, color:"#e74c3c", marginTop:4, fontFamily:"Arial,sans-serif" },
};

export default function Login() {
  const navigate  = useNavigate();
  const [mode,    setMode]    = useState("login");
  const [form,    setForm]    = useState({firstName:"",lastName:"",email:"",phone:"",phoneCode:"+267",city:"",password:"",confirm:""});
  const [agree,   setAgree]   = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [showCf,  setShowCf]  = useState(false);
  const [focused, setFocused] = useState("");
  const sw = pwStrength(form.password);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const inp = (k) => ({
    style:{ ...G.input, ...(focused===k ? G.inputFocus : {}) },
    onFocus:()=>setFocused(k),
    onBlur:()=>setFocused(""),
  });

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!emailOk(form.email))       return setError("Please enter a valid email address.");
    if (!passwordOk(form.password)) return setError("Password must be at least 8 characters and include a number and a special character.");
    if (mode==="register") {
      if (!form.firstName.trim()||!form.lastName.trim()) return setError("Please enter your first and last name.");
      if (form.password!==form.confirm) return setError("Your passwords do not match. Please try again.");
      if (!agree) return setError("Please tick the box to accept the terms and conditions.");
    }
    setLoading(true);
    const endpoint = mode==="login" ? "/api/auth/login" : "/api/auth/register";
    const body = mode==="login"
      ? {email:form.email, password:form.password}
      : {name:`${form.firstName} ${form.lastName}`, email:form.email, password:form.password,
         phone:`${form.phoneCode}${form.phone}`, city:form.city};
    try {
      const res  = await apiFetch(endpoint,{method:"POST",body:JSON.stringify(body)});
      const data = await res.json();
      if (!res.ok) return setError(data.message||"Something went wrong. Please try again.");
      if (mode==="login") {
        localStorage.setItem("token",data.token);
        localStorage.setItem("user",JSON.stringify(data.user));
        notifyAuthChange();
        navigate("/home");
      } else {
        setSuccess("Account created! You can now sign in.");
        setMode("login");
        setForm(f=>({...f,password:"",confirm:""}));
      }
    } catch { setError("Cannot connect to the server. Please check your internet connection."); }
    finally  { setLoading(false); }
  };

  const formPanel = (
    <div style={G.right}>
      <div style={G.rightAccent}/>
      <div style={G.formHdr}>
        <h2 style={G.welcome}>{mode==="login" ? "Welcome back" : "Create your account"}</h2>
        <p style={G.hint}>{mode==="login" ? "Sign in to manage your bookings" : "Join travellers across Botswana"}</p>
      </div>
      <div style={G.tabs}>
        {[["login","Sign In"],["register","Register"]].map(([m,lbl])=>(
          <button key={m} style={{...G.tab,...(mode===m?G.tabActive:{})}}
            onClick={()=>{setMode(m);setError("");setSuccess("");}}>
            {lbl}
          </button>
        ))}
      </div>
      {error   && <div style={G.err}>⚠ {error}</div>}
      {success && <div style={G.ok}>✓ {success}</div>}
      <form onSubmit={submit} autoComplete="off">
        {mode==="register" && (<>
          <div style={G.row2}>
            <div>
              <label style={G.label}>First Name</label>
              <input placeholder="Kabo" value={form.firstName} onChange={e=>set("firstName",e.target.value)} {...inp("fn")}/>
            </div>
            <div>
              <label style={G.label}>Last Name</label>
              <input placeholder="Molefe" value={form.lastName} onChange={e=>set("lastName",e.target.value)} {...inp("ln")}/>
            </div>
          </div>
          <div style={G.field}>
            <label style={G.label}>Phone Number</label>
            <div style={G.phoneWrap}>
              <select style={{...G.phoneCode,...(focused==="pc"?G.inputFocus:{})}} value={form.phoneCode}
                onChange={e=>set("phoneCode",e.target.value)} onFocus={()=>setFocused("pc")} onBlur={()=>setFocused("")}>
                {[["+267","🇧🇼 +267"],["+27","🇿🇦 +27"],["+263","🇿🇼 +263"],["+260","🇿🇲 +260"],["+44","🇬🇧 +44"],["+1","🇺🇸 +1"]]
                  .map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
              <input placeholder="71 234 5678" value={form.phone} onChange={e=>set("phone",e.target.value)}
                style={{...G.input,...(focused==="ph"?G.inputFocus:{}),flex:1}}
                onFocus={()=>setFocused("ph")} onBlur={()=>setFocused("")}/>
            </div>
          </div>
          <div style={G.field}>
            <label style={G.label}>Your City</label>
            <select value={form.city} onChange={e=>set("city",e.target.value)}
              style={{...G.input,...(focused==="ct"?G.inputFocus:{})}}
              onFocus={()=>setFocused("ct")} onBlur={()=>setFocused("")}>
              <option value="">— Select your city —</option>
              {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </>)}
        <div style={G.field}>
          <label style={G.label}>Email Address</label>
          <input type="email" placeholder="kabo@example.com" value={form.email}
            onChange={e=>set("email",e.target.value)} autoComplete="email" {...inp("em")}/>
        </div>
        <div style={G.field}>
          <div style={G.pwHdr}>
            <label style={{...G.label,marginBottom:0}}>Password</label>
            <button type="button" style={G.pwToggle} onClick={()=>setShowPw(s=>!s)}>
              {showPw?"Hide":"Show"}
            </button>
          </div>
          <input type={showPw?"text":"password"}
            placeholder={mode==="register"?"Min. 8 chars, include number & symbol":"Enter your password"}
            value={form.password} onChange={e=>set("password",e.target.value)}
            autoComplete={mode==="register"?"new-password":"current-password"} {...inp("pw")}/>
          {mode==="register" && form.password && (<>
            <div style={G.strengthBar}>
              {[0,1,2,3].map(i=>(
                <div key={i} style={{...G.strengthSeg,background:i<sw?S_COLOR[sw-1]:"#eee"}}/>
              ))}
            </div>
            <div style={G.strengthLbl}>{S_LABEL[sw-1]||""}</div>
          </>)}
        </div>
        {mode==="register" && (
          <div style={G.field}>
            <div style={G.pwHdr}>
              <label style={{...G.label,marginBottom:0}}>Confirm Password</label>
              <button type="button" style={G.pwToggle} onClick={()=>setShowCf(s=>!s)}>
                {showCf?"Hide":"Show"}
              </button>
            </div>
            <input type={showCf?"text":"password"} placeholder="Re-enter your password"
              value={form.confirm} onChange={e=>set("confirm",e.target.value)}
              autoComplete="new-password"
              style={{...G.input,...(focused==="cf"?G.inputFocus:{}),
                borderColor:form.confirm&&form.confirm!==form.password?"#e74c3c":undefined}}
              onFocus={()=>setFocused("cf")} onBlur={()=>setFocused("")}/>
            {form.confirm && form.confirm!==form.password &&
              <div style={G.matchErr}>Passwords do not match</div>}
          </div>
        )}
        {mode==="register" && (
          <div style={G.checkRow}>
            <input type="checkbox" id="terms" checked={agree} onChange={e=>setAgree(e.target.checked)}
              style={{width:17,height:17,marginTop:2,accentColor:"#b49450",cursor:"pointer",flexShrink:0}}/>
            <label htmlFor="terms" style={G.checkLbl}>
              I agree to the <a href="#" style={{color:"#b49450",fontWeight:700}}>Terms of Service</a> and{" "}
              <a href="#" style={{color:"#b49450",fontWeight:700}}>Privacy Policy</a>. I consent to receive
              booking confirmations by email and SMS.
            </label>
          </div>
        )}
        <button type="submit" disabled={loading} style={{...G.btn,...(loading?G.btnDisabled:{})}}>
          {loading ? "Please wait…" : mode==="login" ? "Sign In" : "Create Account"}
        </button>
        {mode==="login" && <a href="#" style={G.forgot}>Forgot your password?</a>}
      </form>
    </div>
  );

  return (
    <>
      <style>{`
        /* Hide left hero on mobile, show compact hero banner instead */
        @media (max-width: 700px) {
          .jc-login-left   { display: none !important; }
          .jc-mobile-hero  { display: flex !important; }
          .jc-login-right  {
            width: 100% !important;
            min-height: unset !important;
            padding: 2rem 1.5rem !important;
          }
          .jc-login-root   { flex-direction: column !important; }
        }
        @media (min-width: 701px) {
          .jc-mobile-hero  { display: none !important; }
        }
      `}</style>

      <div style={G.root} className="jc-login-root">

        {/* ── Desktop: left bus hero ── */}
        <div style={G.left} className="jc-login-left">
          <div style={{...G.busBg, backgroundImage:`url(${BUS_IMG})`}}/>
          <div style={G.busOverlay}/>
          <div style={G.leftContent}>
            <div style={G.logoBadge}>
              <img src={BUS_IMG} alt="Jones Coaches" style={G.logoImg}/>
              <div>
                <span style={G.logoName}>Jones Coaches</span>
                <span style={G.logoSub}>Luxurious Intercity Transport · Est. 2024</span>
              </div>
            </div>
            <h1 style={G.tagline}>
              Travel Botswana<br/>
              with <span style={G.taglineEm}>confidence.</span>
            </h1>
            <p style={G.taglineSub}>Gaborone · Palapye · Francistown · Maun · Kasane</p>
          </div>
        </div>

        {/* ── Mobile: compact hero banner at top ── */}
        <div className="jc-mobile-hero" style={{
          display:"none",
          position:"relative", overflow:"hidden",
          minHeight:200, flexDirection:"column",
          justifyContent:"flex-end", flexShrink:0,
        }}>
          <div style={{
            position:"absolute", inset:0,
            backgroundImage:`url(${BUS_IMG})`,
            backgroundSize:"cover", backgroundPosition:"center 40%",
            filter:"brightness(0.45) saturate(1.1)",
          }}/>
          <div style={{
            position:"absolute", inset:0,
            background:"linear-gradient(to bottom, rgba(5,8,10,0.1) 0%, rgba(5,8,10,0.8) 100%)",
          }}/>
          <div style={{position:"relative", zIndex:2, padding:"1.5rem"}}>
            <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:12}}>
              <img src={BUS_IMG} alt="Jones Coaches" style={{
                width:36, height:36, borderRadius:4, objectFit:"cover",
                border:"1px solid rgba(180,148,80,0.5)",
              }}/>
              <div>
                <div style={{fontFamily:"Georgia,serif", fontSize:"1rem", fontWeight:400,
                  letterSpacing:"0.14em", color:"#f0e8d0", textTransform:"uppercase", lineHeight:1}}>
                  Jones Coaches
                </div>
                <div style={{fontFamily:"'Courier New',monospace", fontSize:"8px",
                  color:"rgba(180,148,80,0.6)", letterSpacing:"0.2em", textTransform:"uppercase", marginTop:2}}>
                  Luxurious Intercity Transport
                </div>
              </div>
            </div>
            <div style={{fontFamily:"Georgia,serif", fontSize:"1.5rem", fontWeight:400,
              color:"rgba(255,255,255,0.92)", lineHeight:1.25,
              textShadow:"0 2px 16px rgba(0,0,0,0.7)"}}>
              Travel Botswana with{" "}
              <em style={{color:"rgba(180,148,80,0.9)", fontStyle:"italic"}}>confidence.</em>
            </div>
            <div style={{marginTop:6, fontSize:12, color:"rgba(255,255,255,0.4)",
              fontFamily:"Arial,sans-serif", letterSpacing:"0.05em"}}>
              Gaborone · Francistown · Maun · Kasane
            </div>
          </div>
        </div>

        {/* ── Form panel (desktop + mobile) ── */}
        <div style={G.right} className="jc-login-right">
          <div style={G.rightAccent}/>
          <div style={G.formHdr}>
            <h2 style={G.welcome}>{mode==="login" ? "Welcome back" : "Create your account"}</h2>
            <p style={G.hint}>{mode==="login" ? "Sign in to manage your bookings" : "Join travellers across Botswana"}</p>
          </div>
          <div style={G.tabs}>
            {[["login","Sign In"],["register","Register"]].map(([m,lbl])=>(
              <button key={m} style={{...G.tab,...(mode===m?G.tabActive:{})}}
                onClick={()=>{setMode(m);setError("");setSuccess("");}}>
                {lbl}
              </button>
            ))}
          </div>
          {error   && <div style={G.err}>⚠ {error}</div>}
          {success && <div style={G.ok}>✓ {success}</div>}
          <form onSubmit={submit} autoComplete="off">
            {mode==="register" && (<>
              <div style={G.row2}>
                <div>
                  <label style={G.label}>First Name</label>
                  <input placeholder="Kabo" value={form.firstName} onChange={e=>set("firstName",e.target.value)} {...inp("fn")}/>
                </div>
                <div>
                  <label style={G.label}>Last Name</label>
                  <input placeholder="Molefe" value={form.lastName} onChange={e=>set("lastName",e.target.value)} {...inp("ln")}/>
                </div>
              </div>
              <div style={G.field}>
                <label style={G.label}>Phone Number</label>
                <div style={G.phoneWrap}>
                  <select style={{...G.phoneCode,...(focused==="pc"?G.inputFocus:{})}} value={form.phoneCode}
                    onChange={e=>set("phoneCode",e.target.value)} onFocus={()=>setFocused("pc")} onBlur={()=>setFocused("")}>
                    {[["+267","🇧🇼 +267"],["+27","🇿🇦 +27"],["+263","🇿🇼 +263"],["+260","🇿🇲 +260"],["+44","🇬🇧 +44"],["+1","🇺🇸 +1"]]
                      .map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                  <input placeholder="71 234 5678" value={form.phone} onChange={e=>set("phone",e.target.value)}
                    style={{...G.input,...(focused==="ph"?G.inputFocus:{}),flex:1}}
                    onFocus={()=>setFocused("ph")} onBlur={()=>setFocused("")}/>
                </div>
              </div>
              <div style={G.field}>
                <label style={G.label}>Your City</label>
                <select value={form.city} onChange={e=>set("city",e.target.value)}
                  style={{...G.input,...(focused==="ct"?G.inputFocus:{})}}
                  onFocus={()=>setFocused("ct")} onBlur={()=>setFocused("")}>
                  <option value="">— Select your city —</option>
                  {CITIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </>)}
            <div style={G.field}>
              <label style={G.label}>Email Address</label>
              <input type="email" placeholder="kabo@example.com" value={form.email}
                onChange={e=>set("email",e.target.value)} autoComplete="email" {...inp("em")}/>
            </div>
            <div style={G.field}>
              <div style={G.pwHdr}>
                <label style={{...G.label,marginBottom:0}}>Password</label>
                <button type="button" style={G.pwToggle} onClick={()=>setShowPw(s=>!s)}>
                  {showPw?"Hide":"Show"}
                </button>
              </div>
              <input type={showPw?"text":"password"}
                placeholder={mode==="register"?"Min. 8 chars, include number & symbol":"Enter your password"}
                value={form.password} onChange={e=>set("password",e.target.value)}
                autoComplete={mode==="register"?"new-password":"current-password"} {...inp("pw")}/>
              {mode==="register" && form.password && (<>
                <div style={G.strengthBar}>
                  {[0,1,2,3].map(i=>(
                    <div key={i} style={{...G.strengthSeg,background:i<sw?S_COLOR[sw-1]:"#eee"}}/>
                  ))}
                </div>
                <div style={G.strengthLbl}>{S_LABEL[sw-1]||""}</div>
              </>)}
            </div>
            {mode==="register" && (
              <div style={G.field}>
                <div style={G.pwHdr}>
                  <label style={{...G.label,marginBottom:0}}>Confirm Password</label>
                  <button type="button" style={G.pwToggle} onClick={()=>setShowCf(s=>!s)}>
                    {showCf?"Hide":"Show"}
                  </button>
                </div>
                <input type={showCf?"text":"password"} placeholder="Re-enter your password"
                  value={form.confirm} onChange={e=>set("confirm",e.target.value)}
                  autoComplete="new-password"
                  style={{...G.input,...(focused==="cf"?G.inputFocus:{}),
                    borderColor:form.confirm&&form.confirm!==form.password?"#e74c3c":undefined}}
                  onFocus={()=>setFocused("cf")} onBlur={()=>setFocused("")}/>
                {form.confirm && form.confirm!==form.password &&
                  <div style={G.matchErr}>Passwords do not match</div>}
              </div>
            )}
            {mode==="register" && (
              <div style={G.checkRow}>
                <input type="checkbox" id="terms" checked={agree} onChange={e=>setAgree(e.target.checked)}
                  style={{width:17,height:17,marginTop:2,accentColor:"#b49450",cursor:"pointer",flexShrink:0}}/>
                <label htmlFor="terms" style={G.checkLbl}>
                  I agree to the <a href="#" style={{color:"#b49450",fontWeight:700}}>Terms of Service</a> and{" "}
                  <a href="#" style={{color:"#b49450",fontWeight:700}}>Privacy Policy</a>. I consent to receive
                  booking confirmations by email and SMS.
                </label>
              </div>
            )}
            <button type="submit" disabled={loading} style={{...G.btn,...(loading?G.btnDisabled:{})}}>
              {loading ? "Please wait…" : mode==="login" ? "Sign In" : "Create Account"}
            </button>
            {mode==="login" && <a href="#" style={G.forgot}>Forgot your password?</a>}
          </form>
        </div>
      </div>
    </>
  );
}