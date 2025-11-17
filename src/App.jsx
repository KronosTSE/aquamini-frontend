import React, { useEffect, useState } from 'react'
setTg(window.Telegram.WebApp)
try{ window.Telegram.WebApp.expand() }catch(e){}
// попытка автозаполнения имени
try{
const user = window.Telegram.WebApp.initDataUnsafe?.user
if (user){
if (!name) setName(user.first_name || '')
}
}catch(e){}
}
},[])


const BACKEND = import.meta.env.VITE_BACKEND_URL || 'https://aquamini-backend.onrender.com'


async function sendOrder(){
setLoading(true)
setResult(null)
try{
const payload = { name, address, bottles, timeOption, phone }
const res = await fetch(BACKEND + '/order', {
method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload)
})
const data = await res.json()
if (res.ok) {
setResult({ ok: true })
// Если запускается внутри Telegram — можно послать данные боту через sendData
if (tg && tg.sendData){
try{ tg.sendData(JSON.stringify({ order: 'sent', orderId: Date.now() })) }catch(e){}
}
} else {
setResult({ ok: false, error: data.error || 'server error' })
}
}catch(err){
setResult({ ok: false, error: err.message })
}finally{ setLoading(false) }
}


// UI-компоненты для шагов
function StepWelcome(){
return (
<div className="card">
<h2>Привет! 👋</h2>
<p>Заказывай воду 19л быстро и удобно прямо в Telegram.</p>
<button onClick={()=>setStep(1)}>Начать</button>
</div>
)
}

function StepBottles(){
<label>Телефон</label>
<input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="+7 7xx xxx xxxx" />
<div className="actions">
<button className="ghost" onClick={()=>setStep(1)}>Назад</button>
<button onClick={()=>setStep(3)}>Далее</button>
</div>
</div>
)
}


function StepTime(){
return (
<div className="card">
<h3>Время доставки</h3>
<div className="time-options">
{['Как можно скорее','Сегодня','Завтра','Выбрать время'].map(opt=> (
<div key={opt} className={`time-row ${timeOption===opt? 'active':''}`} onClick={()=>setTimeOption(opt)}>{opt}</div>
))}
</div>
<div className="actions">
<button className="ghost" onClick={()=>setStep(2)}>Назад</button>
<button onClick={()=>setStep(4)}>Далее</button>
</div>
</div>
)
}


function StepConfirm(){
return (
<div className="card">
<h3>Подтвердите заказ</h3>
<div className="summary">
<div><b>Имя:</b> {name}</div>
<div><b>Адрес:</b> {address}</div>
<div><b>Телефон:</b> {phone}</div>
<div><b>Бутылей:</b> {bottles}</div>
<div><b>Время:</b> {timeOption}</div>
</div>
<div className="actions">
<button className="ghost" onClick={()=>setStep(3)}>Изменить</button>
<button disabled={loading} onClick={sendOrder}>{loading ? 'Отправка...' : 'Подтвердить'}</button>
</div>
{result && (
<div className={`result ${result.ok? 'ok':'err'}`}>{result.ok? 'Заказ отправлен! Мы свяжемся.' : 'Ошибка: '+result.error}</div>
)}
</div>
)
}


return (
<div className="app">
{step===0 && <StepWelcome />}
{step===1 && <StepBottles />}
{step===2 && <StepAddress />}
{step===3 && <StepTime />}
{step===4 && <StepConfirm />}
</div>
)
}
