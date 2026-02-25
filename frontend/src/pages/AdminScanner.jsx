import { QrReader } from "react-qr-reader";

export default function AdminScanner() {
  const scan = async (result) => {
    if (!result) return;

    await fetch(`${API_URL}/admin/scan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ bookingRef: result.text }),
    });
  };

  return <QrReader onResult={scan} />;
}

