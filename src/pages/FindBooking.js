import { useState } from "react";

function FindBooking() {
  const [provider, setProvider] = useState("");

  return (
    <div>
      {/* ...existing code... */}
      <select onChange={e => setProvider(e.target.value)}>
        <option value="paypal">PayPal</option>
        <option value="fnb">FNB</option>
        <option value="orange">Orange Money</option>
        <option value="myzaka">MyZaka</option>
        <option value="bemobile">BeMobile</option>
      </select>
      {/* ...existing code... */}
    </div>
  );
}

export default FindBooking;