import React, { useEffect, useState, useRef } from "react";

export default function App() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [bottles, setBottles] = useState(1);
  const [tg, setTg] = useState(null);
  const [info, setInfo] = useState("");
  const [tgReady, setTgReady] = useState(false);

  const backend = import.meta.env.VITE_BACKEND_URL || "https://aquamini-backend.onrender.com";

  const nameRef = useRef(name);
  const addressRef = useRef(address);
  const bottlesRef = useRef(bottles);

  useEffect(() => { nameRef.current = name }, [name]);
  useEffect(() => { addressRef.current = address }, [address]);
  useEffect(() => { bottlesRef.current = bottles }, [bottles]);

  useEffect(() => {
    const tgObj = window.Telegram?.WebApp;
    if (tgObj) {
      setTg(tgObj);
      setTgReady(true);

      try {
        tgObj.ready();
        tgObj.expand();
        tgObj.MainButton.setText("Отправить заказ");
        tgObj.MainButton.hide();
      } catch (e) {}

      const user = tgObj.initDataUnsafe?.user;
      if (user) {
        const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");
        setName(fullName);
      }
    } else {
      setTgReady(false);
      setInfo("Mini App открыт не в Telegram — кнопка отправки не появится.");
    }
  }, []);

  const sendOrder = async () => {
    const payload = {
      name: nameRef.current,
      address: addressRef.current,
      bottles: Number(bottlesRef.current)
    };

    try {
      const res = await fetch(`${backend}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        if (tg) {
          try {
            tg.MainButton.hide();
            setTimeout(() => tg.close(), 150);
          } catch (e) {}
        }
        alert("Заказ принят!");
      } else {
        alert("Ошибка отправки заказа");
      }
    } catch (err) {
      alert("Ошибка сети: " + err.message);
    }
  };

  useEffect(() => {
    if (!tg) return;
    const handler = sendOrder;
    tg.MainButton.onClick(handler);
    return () => {
      tg.MainButton.offClick?.(handler);
    };
  }, [tg]);

  useEffect(() => {
    const valid = name.trim() && address.trim() && Number(bottles) >= 1;

    if (tg) {
      try {
        if (valid) tg.MainButton.show();
        else tg.MainButton.hide();
      } catch (e) {}
    }

    setInfo(valid ? "Готово к отправке" : "Заполните все поля");
  }, [name, address, bottles, tg]);

  const browserSend = async () => {
    if (tgReady) return;
    await sendOrder();
  };

  return (
    <div style={{ padding: 18, fontFamily: "Inter, Arial", maxWidth: 520, margin: "0 auto" }}>
      <h2>Aquamarin — заказ воды</h2>

      <label>Имя</label>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ width: "100%", padding: 10, borderRadius: 8 }}
      />

      <label style={{ marginTop: 10 }}>Адрес</label>
      <input
        value={address}
        onChange={e => setAddress(e.target.value)}
        style={{ width: "100%", padding: 10, borderRadius: 8 }}
      />

      <label style={{ marginTop: 10 }}>Бутылей</label>
      <input
        type="number"
        min="1"
        value={bottles}
        onChange={e => setBottles(Number(e.target.value))}
        style={{ width: "100%", padding: 10, borderRadius: 8 }}
      />

      {!tgReady && (
        <button
          onClick={browserSend}
          disabled={!(name.trim() && address.trim() && bottles >= 1)}
          style={{
            width: "100%",
            padding: 14,
            marginTop: 16,
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 10
          }}
        >
          Отправить (тест в браузере)
        </button>
      )}

      <div style={{ marginTop: 14, color: "#555", fontSize: 14 }}>{info}</div>

      <pre style={{ marginTop: 16, fontSize: 12, color: "#666" }}>
  tg detected: {String(tgReady)}{"\n"}
  backend: {backend}
</pre>
    </div>
  );
}
