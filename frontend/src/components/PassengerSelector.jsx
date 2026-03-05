
export default function PassengerSelector({ value, onChange }) {
  return (
    <div>
      <label style={{ display:"block", marginBottom:8, fontSize:12, fontWeight:700,
        letterSpacing:"0.05em", color:"#444", textTransform:"uppercase", fontFamily:"Arial,sans-serif" }}>
        Passengers
      </label>
      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
        <button type="button" onClick={()=>onChange(Math.max(1,value-1))} style={{
          width:40, height:40, borderRadius:8, border:"1.5px solid #d0d7de",
          background:"#f5f6fa", color:"#1a73e8", fontSize:22, fontWeight:700,
          display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
        }}>−</button>
        <div style={{ textAlign:"center", minWidth:40 }}>
          <div style={{ fontFamily:"Georgia,serif", fontSize:28, fontWeight:700, color:"#1a1a2e", lineHeight:1 }}>{value}</div>
          <div style={{ fontSize:10, color:"#999", fontFamily:"Arial,sans-serif", textTransform:"uppercase" }}>{value===1?"seat":"seats"}</div>
        </div>
        <button type="button" onClick={()=>onChange(Math.min(20,value+1))} style={{
          width:40, height:40, borderRadius:8, border:"1.5px solid #d0d7de",
          background:"#f5f6fa", color:"#1a73e8", fontSize:22, fontWeight:700,
          display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
        }}>+</button>
      </div>
    </div>
  );
}