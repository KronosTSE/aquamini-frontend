import { useEffect, useState } from "react";

function App() {
  const tg = window.Telegram?.WebApp;
  const backend = import.meta.env.VITE_BACKEND_URL;

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [bottles, setBottles] = useState(1);

  // Инициализация Telegram Mini App
  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      tg.MainButton.setText("Отправить заказ");
      tg.MainButton.hide();

      // Авто-заполнение имени
      const userName = tg.initDataUnsafe?.user?.first_name;
      if (userName) setName(userName);
    }
  }, []);

  // Обработчик отправки заказа
  const sendOrder = async () => {
    const res = await fetch(`${backend}/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, address, bottles }),
    });
    const data = await res.json();

    if (data.ok) {
      tg.close();
    } else {
      alert("Ошибка при отправке заказа");
    }
  };

  // Логика отображения кнопки Telegram
  useEffect(() => {
    if (tg) {
      if (name && address && bottles >= 1) {
        tg.MainButton.show();
        tg.MainButton.onClick(sendOrder);
      } else {
        tg.MainButton.hide();
      }
    }
  }, [name, address, bottles]);

  return (
    <div style={{ padding: 20, fontFamily: "Arial", color: tg?.themeParams.text_color }}>
      <h2>Заказ воды Aquamarin</h2>

      <div style={{ marginBottom: 10 }}>
        <label>Имя:</label>
        <input
          style={{ width: "100%", padding: 10, marginTop: 5 }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ваше имя"
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Адрес:</label>
        <input
          style={{ width: "100%", padding: 10, marginTop: 5 }}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Адрес доставки"
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>Количество бутылей:</label>
        <input
          type="number"
          min="1"
          style={{ width: "100%", padding: 10, marginTop: 5 }}
          value={bottles}
          onChange={(e) => setBottles(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 20, opacity: 0.5 }}>
        Кнопка "Отправить заказ" появится снизу, когда все поля заполнены.
      </div>
    </div>
  );
}

export default App;
