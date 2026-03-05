import { useEffect, useState, useRef } from "react";

const TAKEN = new Set(["1B","2A","2D","3C","4B","5A","6C","7A","7B","8D","9A","10B","11D","12C","13B","14C","15D"]);
const isWin = (id) => id && (id.endsWith("A") || id.endsWith("D") || id==="E1" || id==="E5");

function QRCode({ value, size=150 }) {
  const ref = useRef();
  useEffect(() => {
    if (!ref.current || !value) return;
    const ctx = ref.current.getContext("2d");
    const mod = 21, cell = size / mod;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, size, size); ctx.fillStyle = "#000";
    let h = 0;
    for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
    [[0,0],[0,14],[14,0]].forEach(([r,c]) => {
      ctx.fillStyle = "#000"; ctx.fillRect(c*cell, r*cell, 7*cell, 7*cell);
      ctx.fillStyle = "#fff"; ctx.fillRect((c+1)*cell,(r+1)*cell, 5*cell, 5*cell);
      ctx.fillStyle = "#000"; ctx.fillRect((c+2)*cell,(r+2)*cell, 3*cell, 3*cell);
    });
    for (let r = 0; r < mod; r++)
      for (let c = 0; c < mod; c++) {
        const inF = (r<8&&c<8)||(r<8&&c>12)||(r>12&&c<8);
        if (!inF && (((h ^ (r*mod+c)*2654435761) >>> 0) % 2))
          ctx.fillRect(c*cell, r*cell, cell, cell);
      }
  }, [value, size]);

  const download = () => {
    const a = document.createElement("a");
    a.download = `jones-ticket-${value}.png`;
    a.href = ref.current.toDataURL();
    a.click();
  };

  return (
    <div style={{textAlign:"center"}}>
      <canvas ref={ref} width={size} height={size}
        style={{display:"block",margin:"0 auto",background:"#fff",padding:10,borderRadius:8}}/>
      <button onClick={download} style={{
        marginTop:12,padding:"9px 24px",
        background:"linear-gradient(135deg,#c4a24a,#8a6c2c)",
        border:"none",borderRadius:8,color:"#fff",fontSize:13,
        fontWeight:700,cursor:"pointer",fontFamily:"Georgia,serif"}}>
        Download QR
      </button>
    </div>
  );
}

function ConfCard({ bk, label, onNew }) {
  return (
    <div style={{background:"#111",borderRadius:16,overflow:"hidden",
      marginBottom:20,border:"1.5px solid #3a5a3a",
      boxShadow:"0 4px 24px rgba(0,0,0,0.5)"}}>
      <div style={{height:5,background:"linear-gradient(90deg,#27ae60,#2ecc71)"}}/>
      <div style={{padding:"1.5rem 2rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:"1.5rem"}}>
          <div style={{width:48,height:48,borderRadius:"50%",background:"#1a3a1a",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:24,color:"#27ae60",border:"2px solid #3a5a3a"}}>✓</div>
          <div>
            <div style={{fontFamily:"Georgia,serif",fontSize:"1.3rem",fontWeight:700,color:"#f0ebe0"}}>
              {label} — Confirmed!</div>
            <div style={{fontSize:13,color:"rgba(180,148,80,0.7)",marginTop:3}}>
              Show QR code to driver when boarding</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",
          gap:16,background:"#0e0e0a",borderRadius:12,padding:"1.2rem",marginBottom:"1.5rem",
          border:"1px solid #2a2418"}}>
          {[
            ["Booking Ref", bk.booking_ref],
            ["Route",       bk.routeName||"—"],
            ["Date",        bk.date||"—"],
            ["Departure",   bk.departure||"—"],
            ["From",        bk.pickup||"—"],
            ["To",          bk.dropoff||"—"],
            ["Seats",       (bk.seatNumbers||[]).join(", ")||"—"],
            ["Status",      "Confirmed ✓"],
          ].map(([l,v]) => (
            <div key={l}>
              <div style={{fontSize:10,fontWeight:700,color:"rgba(180,148,80,0.5)",
                textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>{l}</div>
              <div style={{fontSize:15,fontWeight:600,
                color:l==="Status"?"#27ae60":l==="Booking Ref"?"#e8c87d":"#f0ebe0"}}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{background:"#0e0e0a",borderRadius:12,padding:"1.5rem",
          border:"1px solid #2a2418",marginBottom:"1rem"}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:"1rem",fontWeight:700,
            color:"#f0ebe0",textAlign:"center",marginBottom:16}}>Your Boarding Pass</div>
          <QRCode value={bk.booking_ref} size={150}/>
          <div style={{textAlign:"center",marginTop:10,fontSize:12,
            color:"rgba(255,255,255,0.35)",fontStyle:"italic"}}>
            Screenshot or download to use offline
          </div>
        </div>
        {onNew && (
          <button onClick={onNew} style={{
            width:"100%",padding:"12px",background:"transparent",
            border:"1.5px solid #3a2e18",borderRadius:10,
            color:"rgba(180,148,80,0.7)",fontSize:14,fontWeight:700,
            fontFamily:"Georgia,serif",cursor:"pointer"}}>
            Book Another Trip
          </button>
        )}
      </div>
    </div>
  );
}

/* SeatModal has its OWN busy state — no dependency on Home's loading */
function SeatModal({ title, subtitle, passengers, onClose, onConfirm }) {
  const [sel,      setSel]     = useState(new Set());
  const [cnt,      setCnt]     = useState(0);
  const [busy,     setBusy]    = useState(false);
  const [modalErr, setModalErr]= useState("");

  const toggle = (id) => {
    if (TAKEN.has(id) || busy) return;
    setSel(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= passengers) next.delete(next.values().next().value);
        next.add(id);
      }
      setCnt(next.size);
      return next;
    });
  };

  const ss = (id) => {
    const base = {
      height:44, borderRadius:8, cursor:"pointer", display:"flex",
      alignItems:"center", justifyContent:"center",
      fontSize:12, fontWeight:700, fontFamily:"Arial,sans-serif",
      border:"2px solid transparent", transition:"all 0.15s",
    };
    if (TAKEN.has(id)) return {...base,background:"#2a2a2a",color:"#666",cursor:"not-allowed",border:"2px solid #333"};
    if (sel.has(id))   return {...base,background:"linear-gradient(135deg,#c4a24a,#8a6c2c)",color:"#fff",border:"2px solid #6b4e1a",boxShadow:"0 2px 12px rgba(180,148,80,0.5)"};
    if (isWin(id))     return {...base,background:"#1a2418",color:"#c4a24a",border:"2px solid #3a4a28"};
    return                    {...base,background:"#1a1a2a",color:"#8a9ab0",border:"2px solid #2a2a3a"};
  };

  const ready = cnt === passengers;

  const handleConfirm = async () => {
    if (!ready || busy) return;
    setBusy(true);
    setModalErr("");
    try {
      await onConfirm(Array.from(sel));
    } catch (e) {
      console.error("Booking error full details:", e);
      const msg = (typeof e === "string") ? e
                : (e?.message && e.message !== "") ? e.message
                : (e?.error) ? e.error
                : JSON.stringify(e);
      setModalErr(msg || "Booking failed. Check browser console (F12) for details.");
      setBusy(false);
    }
  };

  return (
    <div onClick={e=>{if(e.target===e.currentTarget && !busy) onClose();}} style={{
      position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:200,
      display:"flex",alignItems:"center",justifyContent:"center",
      backdropFilter:"blur(6px)",padding:"1rem"}}>
      <div style={{background:"#111",borderRadius:20,width:"min(700px,100%)",
        maxHeight:"92vh",overflowY:"auto",
        boxShadow:"0 20px 60px rgba(0,0,0,0.8)",border:"1px solid #2a2a2a"}}>

        <div style={{padding:"20px 24px",borderBottom:"1px solid #1e1e1e",
          display:"flex",justifyContent:"space-between",alignItems:"center",
          position:"sticky",top:0,background:"#111",zIndex:1}}>
          <div>
            <div style={{fontFamily:"Georgia,serif",fontSize:"1.2rem",fontWeight:700,color:"#f0ebe0"}}>{title}</div>
            <div style={{fontSize:13,color:"rgba(180,148,80,0.6)",marginTop:3}}>{subtitle}</div>
          </div>
          <button onClick={()=>{ if(!busy) onClose(); }} style={{
            width:36,height:36,borderRadius:8,border:"1px solid #333",
            background:"#1a1a1a",fontSize:16,cursor:"pointer",color:"#888",
            display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>

        <div style={{padding:"20px 24px"}}>
          <div style={{display:"flex",gap:16,marginBottom:20,flexWrap:"wrap",
            background:"#0e0e0a",borderRadius:10,padding:"12px 16px",border:"1px solid #1e1e1e"}}>
            {[
              ["#1a2418","#3a4a28","Window"],
              ["#1a1a2a","#2a2a3a","Aisle"],
              ["linear-gradient(135deg,#c4a24a,#8a6c2c)","#6b4e1a","Selected"],
              ["#2a2a2a","#333","Taken"],
            ].map(([bg,bd,lbl])=>(
              <div key={lbl} style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:24,height:24,borderRadius:5,background:bg,border:`2px solid ${bd}`}}/>
                <span style={{fontSize:13,color:"#c8b99a"}}>{lbl}</span>
              </div>
            ))}
          </div>

          <div style={{background:"#0e0e0a",borderRadius:12,padding:"16px",border:"1px solid #1e1e1e"}}>
            <div style={{textAlign:"center",marginBottom:16}}>
              <span style={{display:"inline-block",padding:"7px 22px",
                background:"linear-gradient(135deg,#c4a24a,#8a6c2c)",
                borderRadius:20,color:"#fff",fontSize:12,fontWeight:700,
                fontFamily:"Georgia,serif",letterSpacing:"0.05em"}}>DRIVER — FRONT</span>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"32px 1fr 20px 1fr 32px",gap:6,marginBottom:10}}>
              <div/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                <div style={{textAlign:"center",fontSize:11,fontWeight:700,color:"rgba(180,148,80,0.6)"}}>A — WINDOW</div>
                <div style={{textAlign:"center",fontSize:11,fontWeight:700,color:"rgba(180,148,80,0.6)"}}>B</div>
              </div>
              <div style={{textAlign:"center",color:"#333"}}>|</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                <div style={{textAlign:"center",fontSize:11,fontWeight:700,color:"rgba(180,148,80,0.6)"}}>C</div>
                <div style={{textAlign:"center",fontSize:11,fontWeight:700,color:"rgba(180,148,80,0.6)"}}>D — WINDOW</div>
              </div>
              <div/>
            </div>

            {Array.from({length:15},(_,i)=>i+1).map(r=>(
              <div key={r} style={{display:"grid",gridTemplateColumns:"32px 1fr 20px 1fr 32px",gap:6,marginBottom:6,alignItems:"center"}}>
                <div style={{textAlign:"center",fontSize:11,color:"#555",fontWeight:700}}>{r}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {["A","B"].map(c=>(
                    <button key={c} onClick={()=>toggle(`${r}${c}`)} style={ss(`${r}${c}`)}>{r}{c}</button>
                  ))}
                </div>
                <div style={{textAlign:"center",color:"#333",fontSize:14}}>|</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {["C","D"].map(c=>(
                    <button key={c} onClick={()=>toggle(`${r}${c}`)} style={ss(`${r}${c}`)}>{r}{c}</button>
                  ))}
                </div>
                <div/>
              </div>
            ))}

            <div style={{borderTop:"1px solid #2a2418",marginTop:12,paddingTop:14}}>
              <div style={{textAlign:"center",fontSize:11,color:"rgba(180,148,80,0.4)",
                marginBottom:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em"}}>Rear Row</div>
              <div style={{display:"flex",gap:6,justifyContent:"center"}}>
                {["E1","E2","E3","E4","E5"].map(id=>(
                  <button key={id} onClick={()=>toggle(id)} style={{...ss(id),width:52}}>{id}</button>
                ))}
              </div>
            </div>
          </div>

          {modalErr && (
            <div style={{marginTop:12,padding:"11px 14px",background:"#1f0808",
              border:"1px solid #5a1a1a",borderRadius:8,color:"#ff8a80",
              fontSize:13,display:"flex",gap:8,alignItems:"center"}}>
              <span>⚠ {modalErr}</span>
              <button onClick={()=>setModalErr("")} style={{marginLeft:"auto",background:"none",
                border:"none",color:"#ff8a80",cursor:"pointer",fontSize:15}}>✕</button>
            </div>
          )}

          <div style={{marginTop:16,padding:"16px 18px",
            background:ready?"#0e1f0e":"#0e0e0a",
            border:`1.5px solid ${ready?"#3a5a3a":"#2a2418"}`,
            borderRadius:10,display:"flex",justifyContent:"space-between",
            alignItems:"center",flexWrap:"wrap",gap:12,transition:"all 0.3s"}}>
            <div>
              <div style={{fontSize:11,color:"rgba(180,148,80,0.5)",fontWeight:700,
                textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Selected Seats</div>
              <div style={{fontSize:15,fontWeight:700,color:"#f0ebe0"}}>
                {cnt===0 ? "Tap a seat to select" : Array.from(sel).join(", ")}
              </div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:3}}>
                {cnt} of {passengers} seat{passengers>1?"s":""} chosen
              </div>
            </div>
            <button onClick={handleConfirm} style={{
              padding:"13px 32px",minWidth:160,
              background:busy?"#1a1710":ready?"linear-gradient(135deg,#c4a24a,#8a6c2c)":"#2a2418",
              border:busy?"1px solid #3a2e18":"none",
              borderRadius:10,
              color:ready&&!busy?"#fff":"#666",
              fontSize:15,fontWeight:700,fontFamily:"Georgia,serif",
              cursor:ready&&!busy?"pointer":"default",
              boxShadow:ready&&!busy?"0 4px 14px rgba(180,148,80,0.4)":"none",
              transition:"all 0.2s",
              opacity:ready?1:0.5,
            }}>
              {busy ? "Booking..." : "Confirm Seats"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [routes,     setRoutes]    = useState([]);
  const [route,      setRoute]     = useState(null);
  const [trips,      setTrips]     = useState([]);
  const [tripType,   setTripType]  = useState("oneway");
  const [tripId,     setTripId]    = useState("");
  const [date,       setDate]      = useState("");
  const [pickup,     setPickup]    = useState("");
  const [dropoff,    setDropoff]   = useState("");
  const [passengers, setPassengers]= useState(1);
  const [retTripId,  setRetTripId] = useState("");
  const [retDate,    setRetDate]   = useState("");
  const [step,       setStep]      = useState("form");
  const [error,      setError]     = useState("");
  const [outConf,    setOutConf]   = useState(null);
  const [retConf,    setRetConf]   = useState(null);

  useEffect(() => {
    fetch("/api/routes").then(r=>r.json()).then(setRoutes).catch(()=>{});
  }, []);

  useEffect(() => {
    if (!route) { setTrips([]); return; }
    fetch(`/api/trips/route/${route.id}`).then(r=>r.json()).then(setTrips).catch(()=>setTrips([]));
  }, [route]);

  const today = new Date().toISOString().split("T")[0];

  const goSelectSeats = () => {
    setError("");
    if (!tripId||!date||!pickup.trim()||!dropoff.trim())
      return setError("Please fill in route, departure time, date, pickup and drop-off.");
    if (tripType==="return" && (!retTripId||!retDate))
      return setError("Please select a return departure and return date.");
    setStep("outbound-seats");
  };

  /* throws on failure so SeatModal catches it and shows error inside the modal */
  const bookOutbound = async (seats) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Session expired — please sign in again.");
    const res = await fetch("/api/bookings", {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},
      body:JSON.stringify({
        tripId:Number(tripId), pickup:pickup.trim(),
        dropoff:dropoff.trim(), date, seats:Number(passengers),
      }),
    });
    // Safely parse — backend might return empty body on some errors
    const text = await res.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; }
    catch { throw new Error("Server error ("+res.status+"): "+text.slice(0,120)); }
    if (!res.ok) throw new Error(data.message||data.error||"Booking failed — status "+res.status);
    const bk = data.booking||data;
    setOutConf({
      ...bk, seatNumbers:seats, routeName:route?.name,
      date, pickup, dropoff,
      departure:trips.find(t=>String(t.id)===String(tripId))?.departure_time,
    });
    setStep(tripType==="return"?"return-seats":"done");
  };

  const bookReturn = async (seats) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Session expired — please sign in again.");
    const res = await fetch("/api/bookings", {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer "+token},
      body:JSON.stringify({
        tripId:Number(retTripId), pickup:dropoff.trim(),
        dropoff:pickup.trim(), date:retDate, seats:Number(passengers),
      }),
    });
    const text = await res.text();
    let data = {};
    try { data = text ? JSON.parse(text) : {}; }
    catch { throw new Error("Server error ("+res.status+"): "+text.slice(0,120)); }
    if (!res.ok) throw new Error(data.message||data.error||"Return booking failed — status "+res.status);
    const bk = data.booking||data;
    setRetConf({
      ...bk, seatNumbers:seats,
      routeName:(route?.name||"Route")+" (Return)",
      date:retDate, pickup:dropoff, dropoff:pickup,
      departure:trips.find(t=>String(t.id)===String(retTripId))?.departure_time,
    });
    setStep("done");
  };

  const reset = () => {
    setStep("form"); setOutConf(null); setRetConf(null);
    setTripId(""); setDate(""); setRetTripId(""); setRetDate("");
    setPickup(""); setDropoff(""); setPassengers(1);
    setRoute(null); setTrips([]);
  };

  const LBL = {display:"block",marginBottom:8,fontSize:11,fontWeight:700,
    letterSpacing:"0.08em",color:"rgba(180,148,80,0.7)",
    textTransform:"uppercase",fontFamily:"Georgia,serif"};
  const INP = {width:"100%",padding:"13px 14px",background:"#1a1710",
    border:"1.5px solid #2a2418",borderRadius:10,fontSize:15,
    color:"#f0ebe0",WebkitTextFillColor:"#f0ebe0",fontFamily:"Arial,sans-serif",
    outline:"none",boxSizing:"border-box",transition:"all 0.2s",
    WebkitBoxShadow:"0 0 0px 1000px #1a1710 inset"};
  const onFocus = e=>{e.currentTarget.style.borderColor="#c4a24a";e.currentTarget.style.boxShadow="0 0 0 3px rgba(180,148,80,0.15)";};
  const onBlur  = e=>{e.currentTarget.style.borderColor="#2a2418";e.currentTarget.style.boxShadow="none";};
  const SEL = {...INP,cursor:"pointer",WebkitAppearance:"none",appearance:"none"};

  return (
    <div style={{minHeight:"100vh",background:"#0c0c0c",fontFamily:"Arial,sans-serif"}}>
      <style>{`
        input,select,textarea{color:#f0ebe0 !important;background-color:#1a1710 !important;-webkit-text-fill-color:#f0ebe0 !important;}
        input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus{-webkit-box-shadow:0 0 0px 1000px #1a1710 inset !important;-webkit-text-fill-color:#f0ebe0 !important;caret-color:#f0ebe0;}
        select option{background:#1a1710 !important;color:#f0ebe0 !important;}
        input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(1);}
        input::placeholder{color:rgba(255,255,255,0.25) !important;}
      `}</style>

      <div style={{background:"linear-gradient(135deg,#0e0c06 0%,#1a1208 50%,#0e0c06 100%)",
        padding:"3rem 2rem 2.5rem",textAlign:"center",position:"relative",overflow:"hidden",
        borderBottom:"1px solid #2a2418"}}>
        <div style={{position:"absolute",inset:0,opacity:0.04,
          backgroundImage:"radial-gradient(circle,#c4a24a 1px,transparent 1px)",backgroundSize:"28px 28px"}}/>
        <h1 style={{fontFamily:"Georgia,'Times New Roman',serif",
          fontSize:"clamp(1.8rem,4vw,2.8rem)",fontWeight:300,
          color:"#f0ebe0",margin:"0 0 8px",position:"relative",letterSpacing:"0.04em"}}>
          Where are you <em style={{color:"#e8c87d",fontStyle:"italic"}}>travelling today?</em>
        </h1>
        <p style={{color:"rgba(255,255,255,0.35)",fontSize:12,margin:0,
          fontFamily:"'Courier New',monospace",letterSpacing:"0.15em",
          textTransform:"uppercase",position:"relative"}}>
          Comfortable · Reliable · On time across Botswana
        </p>
      </div>

      <div style={{maxWidth:860,margin:"0 auto",padding:"2rem 1.5rem"}}>
        {error && (
          <div style={{background:"#1f0e0e",border:"1.5px solid #5a2020",borderRadius:10,
            padding:"13px 16px",color:"#e07070",fontSize:14,marginBottom:"1.5rem",
            display:"flex",alignItems:"center",gap:8}}>
            ⚠ {error}
            <button onClick={()=>setError("")} style={{marginLeft:"auto",background:"none",
              border:"none",color:"#e07070",cursor:"pointer",fontSize:16}}>✕</button>
          </div>
        )}

        {step==="done" && (
          <>
            {outConf && <ConfCard bk={outConf} label="Outbound Journey" onNew={!retConf?reset:undefined}/>}
            {retConf  && <ConfCard bk={retConf} label="Return Journey" onNew={reset}/>}
            {(outConf&&retConf) && (
              <button onClick={reset} style={{width:"100%",padding:"14px",
                background:"linear-gradient(135deg,#c4a24a,#8a6c2c)",border:"none",
                borderRadius:12,color:"#fff",fontSize:16,fontWeight:700,
                fontFamily:"Georgia,serif",cursor:"pointer"}}>
                Book Another Trip
              </button>
            )}
          </>
        )}

        {step==="form" && (
          <div style={{background:"#111",borderRadius:16,padding:"2rem",
            border:"1px solid #1e1e1e",boxShadow:"0 4px 24px rgba(0,0,0,0.4)"}}>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"1.4rem",fontWeight:400,
              color:"#f0ebe0",margin:"0 0 1.5rem",letterSpacing:"0.04em"}}>
              Book Your Journey
            </h2>

            <div style={{display:"flex",background:"#0e0e0a",borderRadius:10,
              padding:4,marginBottom:"1.75rem",gap:4,border:"1px solid #1e1e1e"}}>
              {[["oneway","One Way"],["return","Round Trip"]].map(([v,l])=>(
                <button key={v} type="button" onClick={()=>setTripType(v)} style={{
                  flex:1,padding:"11px",borderRadius:8,
                  background:tripType===v?"#1a1710":"transparent",
                  color:tripType===v?"#e8c87d":"rgba(255,255,255,0.35)",
                  fontSize:15,fontWeight:tripType===v?700:400,
                  fontFamily:"Georgia,serif",cursor:"pointer",
                  border:tripType===v?"1px solid #3a2e18":"1px solid transparent",
                  transition:"all 0.2s"}}>
                  {l}
                </button>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:16}}>
              <div>
                <label style={LBL}>Route</label>
                <div style={{position:"relative"}}>
                  <select style={SEL} onFocus={onFocus} onBlur={onBlur}
                    onChange={e=>setRoute(routes.find(r=>String(r.id)===e.target.value)||null)}>
                    <option value="">Select route</option>
                    {routes.map(r=><option key={r.id} value={String(r.id)}>{r.name}</option>)}
                  </select>
                  <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
                    color:"rgba(180,148,80,0.5)",pointerEvents:"none",fontSize:12}}>▼</span>
                </div>
              </div>
              <div>
                <label style={LBL}>Departure Time</label>
                <div style={{position:"relative"}}>
                  <select style={SEL} onFocus={onFocus} onBlur={onBlur}
                    onChange={e=>setTripId(e.target.value)}>
                    <option value="">Select time</option>
                    {trips.map(t=>(
                      <option key={t.id} value={String(t.id)}>
                        {t.departure_time} — {t.seats_available} seats
                      </option>
                    ))}
                  </select>
                  <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
                    color:"rgba(180,148,80,0.5)",pointerEvents:"none",fontSize:12}}>▼</span>
                </div>
              </div>
              <div>
                <label style={LBL}>Travel Date</label>
                <input type="date" style={{...INP,colorScheme:"dark"}}
                  min={today} onFocus={onFocus} onBlur={onBlur}
                  onChange={e=>setDate(e.target.value)}/>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:"1.5rem"}}>
              <div>
                <label style={LBL}>Pickup Location</label>
                <input type="text" style={INP} placeholder="e.g. Main Mall, Gaborone"
                  onFocus={onFocus} onBlur={onBlur} onChange={e=>setPickup(e.target.value)}/>
              </div>
              <div>
                <label style={LBL}>Drop-off Location</label>
                <input type="text" style={INP} placeholder="e.g. Francistown Bus Rank"
                  onFocus={onFocus} onBlur={onBlur} onChange={e=>setDropoff(e.target.value)}/>
              </div>
            </div>

            {tripType==="return" && (
              <div style={{marginBottom:"1.75rem",padding:"1.25rem",
                background:"#0e0d0a",borderRadius:12,border:"1px solid #2a2418"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                  <div style={{flex:1,height:1,background:"#2a2418"}}/>
                  <span style={{fontSize:11,fontWeight:700,color:"rgba(180,148,80,0.5)",
                    textTransform:"uppercase",letterSpacing:"0.12em",fontFamily:"Georgia,serif"}}>Return</span>
                  <div style={{flex:1,height:1,background:"#2a2418"}}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                  <div>
                    <label style={LBL}>Return Date</label>
                    <input type="date" style={{...INP,colorScheme:"dark"}} min={date||today}
                      onFocus={onFocus} onBlur={onBlur} onChange={e=>setRetDate(e.target.value)}/>
                  </div>
                  <div>
                    <label style={LBL}>Return Departure</label>
                    <div style={{position:"relative"}}>
                      <select style={SEL} onFocus={onFocus} onBlur={onBlur}
                        onChange={e=>setRetTripId(e.target.value)}>
                        <option value="">Select return time</option>
                        {trips.map(t=>(
                          <option key={t.id} value={String(t.id)}>
                            {t.departure_time} — {t.seats_available} seats
                          </option>
                        ))}
                      </select>
                      <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
                        color:"rgba(180,148,80,0.5)",pointerEvents:"none",fontSize:12}}>▼</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{marginBottom:"1.75rem"}}>
              <label style={LBL}>Passengers</label>
              <div style={{display:"flex",alignItems:"center",gap:16}}>
                {["-","+"].map((sym,i)=>(
                  <button key={sym} type="button"
                    onClick={()=>setPassengers(p=>i===0?Math.max(1,p-1):Math.min(20,p+1))}
                    style={{width:44,height:44,borderRadius:10,border:"1.5px solid #2a2418",
                      background:"#1a1710",color:"#c4a24a",fontSize:24,fontWeight:700,
                      display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                    {sym}
                  </button>
                ))}
                <div style={{textAlign:"center",minWidth:52}}>
                  <div style={{fontFamily:"Georgia,serif",fontSize:32,fontWeight:700,color:"#f0ebe0",lineHeight:1}}>{passengers}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.06em"}}>
                    {passengers===1?"seat":"seats"}
                  </div>
                </div>
              </div>
            </div>

            <button onClick={goSelectSeats} style={{
              width:"100%",padding:"16px",
              background:"linear-gradient(135deg,#c4a24a,#8a6c2c)",
              border:"none",borderRadius:12,color:"#fff",
              fontSize:16,fontWeight:700,fontFamily:"Georgia,serif",
              cursor:"pointer",letterSpacing:"0.04em",
              boxShadow:"0 4px 18px rgba(180,148,80,0.35)"}}>
              {tripType==="return"?"Choose Outbound Seats":"Choose Your Seats"}
            </button>
          </div>
        )}

        {step==="form" && (
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:"1.5rem",justifyContent:"center"}}>
            {["Reclining Seats","Free Wi-Fi","Instant QR Ticket","On-Time Guarantee","Round Trip Booking"].map(f=>(
              <span key={f} style={{padding:"6px 16px",background:"#111",
                border:"1px solid #2a2418",borderRadius:100,
                fontSize:12,color:"rgba(180,148,80,0.6)",fontFamily:"Georgia,serif"}}>
                {f}
              </span>
            ))}
          </div>
        )}
      </div>

      {step==="outbound-seats" && (
        <SeatModal title="Choose Outbound Seats"
          subtitle={`${route?.name||"Route"} · ${date} · ${passengers} seat${passengers>1?"s":""}`}
          passengers={passengers} onClose={()=>setStep("form")} onConfirm={bookOutbound}/>
      )}
      {step==="return-seats" && (
        <SeatModal title="Choose Return Seats"
          subtitle={`${route?.name||"Route"} (Return) · ${retDate} · ${passengers} seat${passengers>1?"s":""}`}
          passengers={passengers} onClose={()=>setStep("form")} onConfirm={bookReturn}/>
      )}
    </div>
  );
}