
import { db } from './_db.js';

async function sendTelegramNotification(message) {
  // 환경변수에서 토큰 찾기
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7224856037:AAFI0xI30XyJ-pY1M-P5lRzH6fR9fXvYvYk";
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "1028713025"; // 준혁 대표님 ID로 추정되는 값
  
  if (!BOT_TOKEN || !CHAT_ID) return false;

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'HTML' })
    });
    return response.ok;
  } catch (err) {
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  const { imp_uid, merchant_uid, paymentMethod, bookingData, authno } = req.body;
  const isMock = bookingData?.is_mock || imp_uid === 'MOCK_SUCCESS';

  try {
    const newBooking = {
      ...bookingData,
      id: merchant_uid,
      imp_uid: imp_uid || authno || (paymentMethod === 'BANK' ? 'BANK_TRANSFER' : 'NEXPAY_AUTO'),
      status: paymentMethod === 'BANK' ? 'WAITING_DEPOSIT' : 'PAID',
      paidAt: paymentMethod === 'BANK' ? null : new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    const methodEmoji = paymentMethod === 'BANK' ? '🏦' : '💳';
    const statusText = paymentMethod === 'BANK' ? '<b>[입금 대기]</b>' : '<b>[결제 완료]</b>';
    const mockTag = isMock ? ' 🧪 <b>[가상결제테스트]</b>' : '';
    
    const telegramMsg = `
${methodEmoji} <b>새로운 예약 발생${mockTag}</b>

👤 예약자: ${newBooking.userName} (${newBooking.userPhone})
🐾 반려동물: ${newBooking.petName} (${newBooking.petBreed})
🛠 서비스: ${newBooking.serviceName}
📅 일정: ${newBooking.startDate} ~ ${newBooking.endDate}
💰 금액: ${newBooking.totalCost.toLocaleString()}원
상태: ${statusText}
ID: <code>${merchant_uid}</code>
    `.trim();

    await sendTelegramNotification(telegramMsg);

    // 가상 DB에 저장
    db.bookings.push(newBooking);

    return res.status(200).json({ 
      success: true, 
      message: '예약 처리가 완료되었습니다.',
      is_mock: isMock
    });
  } catch (err) {
    console.error('[VERIFY_ERROR]', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
