import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [bottles, setBottles] = useState(1);
  const [info, setInfo] = useState("");
  const [tgPresent, setTgPresent] = useState(false);

  const backend = import.meta.env.VITE_BACKEND_URL || "https://aquamini-backend.onrender.com";

  // refs for latest values (handler will read refs to avoid re-registering listener)
  const nameRef = useRef(name);
  const addressRef = useRef(address);
  const bottlesRef = useRef(bottles);
  useEffect(() => { nameRef.current = name }, [name]);
  useEffect(() => { addressRef.current = address }, [address]);
  useEffect(() => { bottlesRef.current = bottles }, [bottles]);

  // tg object state (set once)
  const [tg, setTg] = useState(null);

  useEffect(() => {
    const tgObj = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
    if (tgObj) {
      setTg(tgObj);
      setTgPresent(true);
      try {
        tgObj.ready();
        try { tgObj.expand(); } catch(e) {}
        tgObj.MainButton.setText("Отправить заказ");
        tgObj.MainButton.hide();
        // try autofill
        const userName = tgObj.initDataUnsafe?.user?.first_name;
        if (userName && !name) setName(userName);
      } catch (e) {
        console.warn("Telegram init error:", e);
      }
    } else {
      setTgPresent(false);
      setInfo("Запущено в браузере — MainButton виден только в Telegram.");
    }
  }, []);

  // single click handler (uses refs)
  const sendOrderViaRefs = async () => {
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
        try { tg?.close(); } catch(e) {}
        alert("Заказ принят!");
      } else {
        alert("Ошибка сервера: " + (data.error || "unknown"));
      }
    } catch (err) {
      console.error(err);
      alert("Ошибка отправки: " + err.message);
    }
  };

  // register onClick once
  useEffect(() => {
    if (!tg) return;
    const handler = sendOrderViaRefs;
    try {
      // register once
      tg.MainButton.onClick(handler);
    } catch (e) {
      console.warn("MainButton.onClick register error:", e);
    }
    return () => {
      try { tg.MainButton.offClick?.(handler); } catch (e) {}
    };
  }, [tg]); // only when tg becomes available

  // show/hide MainButton when fields change
  useEffect(() => {
    const allFilled = name.trim() !== "" && address.trim() !== "" && Number(bottles) >= 1;
    if (tg) {
      try {
        if (allFilled) tg.MainButton.show();
        else tg.MainButton.hide();
      } catch (e) {
        console.warn("MainButton show/hide error:", e);
      }
    }
    setInfo(allFilled ? "Готово — используйте кнопку в Telegram или кнопку ниже (для браузера)." : "Заполните все поля, чтобы активировать кнопку.");
  }, [name, address, bottles, tg]);

  // fallback for browser: local send button
  const canSend = name.trim() !== "" && address.trim() !== "" && Number(bottles) >= 1;

  return (
    <div style={{ padding: 18, fontFamily: "Inter, Arial, sans-serif", maxWidth: 520, margin: "0 auto" }}>
      <h2 style={{ marginTop: 8 }}>Aquamarin — Заказ воды</h2>

      <label style={{ display: "block", marginTop: 12 }}>Имя</label>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Ваше имя" style={{ width: "100%", padding: 10, borderRadius: 8 }} />

      <label style={{ display: "block", marginTop: 8 }}>Адрес</label>
      <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Улица, дом, квартира" style={{ width: "100%", padding: 10, borderRadius: 8 }} />

      <label style={{ display: "block", marginTop: 8 }}>Количество бутылей</label>
      <input type="number" min="1" value={bottles} onChange={e => setBottles(Number(e.target.value))} style={{ width: "100%", padding: 10, borderRadius: 8 }} />

      <div style={{ marginTop: 12, color: "#444" }}>{info}</div>

      <button
        onClick={sendOrderViaRefs}
        disabled={!canSend}
        style={{
          marginTop: 14,
          width: "100%",
          padding: 12,
          borderRadius: 10,
          background: canSend ? "#0b76ff" : "#9fc6ff",
          color: "white",
          border: "none",
          cursor: canSend ? "pointer" : "not-allowed"
        }}
      >
        {canSend ? "Отправить (тест, браузер)" : "Заполните все поля"}
      </button>

      <pre style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
        tg present: {String(!!tg)}{"\n"}
        Vercel backend: {String(Boolean(backend))}
      </pre>
    </div>
  );
}
