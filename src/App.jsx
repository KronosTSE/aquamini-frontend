import { useEffect, useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [bottles, setBottles] = useState(1);
  const backend = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    try {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  const sendOrder = async () => {
    const res = await fetch(`${backend}/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, address, bottles })
    });

    const data = await res.json();
    if (data.ok) alert("Заказ отправлен!");
    else alert("Ошибка отправки");
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h2>Aquamarin — заказ воды</h2>

      <input
        placeholder="Ваше имя"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <input
        placeholder="Адрес доставки"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <input
        type="number"
        min="1"
        value={bottles}
        onChange={(e) => setBottles(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <button
        onClick={sendOrder}
        style={{
          width: "100%",
          padding: 15,
          background: "#0088ff",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontSize: 18,
        }}
      >
        Сделать заказ
      </button>
    </div>
  );
}

export default App;
