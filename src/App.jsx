import { useState } from "react";

export default function App() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [bottles, setBottles] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const BACKEND = "https://aquamini-backend.onrender.com/order";

  async function submitOrder() {
    setLoading(true);
    setDone(false);

    const res = await fetch(BACKEND, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, address, bottles })
    });

    setLoading(false);
    if (res.ok) setDone(true);
  }

  return (
    <div className="container">
      <h1>Заказ воды Aquamarin</h1>

      <label>Ваше имя</label>
      <input value={name} onChange={(e) => setName(e.target.value)} />

      <label>Адрес доставки</label>
      <input value={address} onChange={(e) => setAddress(e.target.value)} />

      <label>Количество бутылей</label>
      <input
        type="number"
        min="1"
        value={bottles}
        onChange={(e) => setBottles(Number(e.target.value))}
      />

      <button disabled={loading} onClick={submitOrder}>
        {loading ? "Отправка..." : "Сделать заказ"}
      </button>

      {done && <p className="success">Ваш заказ отправлен!</p>}
    </div>
  );
}
