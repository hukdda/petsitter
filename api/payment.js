import { db } from './_db.js';

async function sendTelegram(msg) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7224856037:AAFI0xI30XyJ-pY1M-P5lRzH6fR9fXvYvYk";
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "1028713025";
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'HTML' })
    });
  } catch (e) {}
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { merchant_uid, amount, paymentMethod, bookingData } = req.body;

  try {
    const newBooking = {
      ...bookingData,
      id: merchant_uid,
      status: paymentMethod === 'BANK' ? 'WAITING_DEPOSIT' : 'PAID',
      paidAt: paymentMethod === 'BANK' ? null : new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    db.bookings.push(newBooking);

    const methodEmoji = paymentMethod === 'BANK' ? '🏦' : '💳';
    const statusText = paymentMethod === 'BANK' ? '[입금 대기]' : '[결제 완료]';
    
    const telegramMsg = `
${methodEmoji} <b>새로운 예약 발생</b>

👤 예약자: ${newBooking.userName} (${newBooking.userPhone})
🐾 반려동물: ${newBooking.petName}
🛠 서비스: ${newBooking.serviceName}
📅 일정: ${newBooking.startDate} ~ ${newBooking.endDate}
💰 금액: ${newBooking.totalCost.toLocaleString()}원
상태: ${statusText}
${paymentMethod === 'BANK' ? `💵 입금자: ${newBooking.depositorName}` : ''}
    `.trim();

    await sendTelegram(telegramMsg);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[PAYMENT_ERROR]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
