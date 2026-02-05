<<<<<<< HEAD

=======
>>>>>>> eb423f517925f7b12f1d3f3e160c6f538480f8cc
import { db } from './_db.js';

async function sendTelegram(msg) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7224856037:AAFI0xI30XyJ-pY1M-P5lRzH6fR9fXvYvYk";
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "1028713025";
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
<<<<<<< HEAD
      method: 'POST', headers: { 'Content-Type': 'application/json' },
=======
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
>>>>>>> eb423f517925f7b12f1d3f3e160c6f538480f8cc
      body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'HTML' })
    });
  } catch (e) {}
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
<<<<<<< HEAD
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const path = req.url.split('?')[0];

  // 1. 수기 결제
  if (path.includes('card-sugi')) {
    const { amount, cardNumber, cardExpiry, installment, cardAuth, cardPassword, productName, bookingData } = req.body;
    const USERID = process.env.NEXPAY_USERID || "DA77436573";
    const API_KEY = process.env.NEXPAY_KEY || "AIyW5KfZL0TDU)sH";
    try {
      const tRes = await fetch('https://develop.nex-pay.co.kr/nexpay/Api', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY },
        body: JSON.stringify({ USERID, Type: 'CARD' })
      });
      const tData = await tRes.json();
      const pRes = await fetch(tData.ReturnURL, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY, 'TOKEN': tData.TOKEN },
        body: JSON.stringify({
          USERID, PAYMETHOD: 'CARD-SUGI', p_price: String(amount),
          card_num: cardNumber.replace(/\s/g, ''), card_useable: cardExpiry.replace(/\//g, ''),
          installment: String(installment || '00').padStart(2, '0'),
          CARD_AUTH: cardAuth, PASSWD: cardPassword, p_product_name: productName || '펫시터 방문 돌봄'
        })
      });
      const pResult = await pRes.json();
      if (pResult.code === '0000') {
        const newBooking = { ...bookingData, id: pResult.order_number, status: 'PAID', paidAt: new Date().toISOString() };
        db.bookings.push(newBooking);
        await sendTelegram(`💳 <b>[수기결제 완료]</b>\n👤 ${newBooking.userName}\n💰 ${Number(amount).toLocaleString()}원`);
        return res.status(200).json({ success: true, data: pResult });
      }
      return res.status(400).json({ success: false, message: pResult.msg });
    } catch (e) { return res.status(500).json({ success: false, message: e.message }); }
  }

  // 2. 일반 결제 검증
  if (path.includes('verify')) {
    const { merchant_uid, bookingData } = req.body;
    const newBooking = { ...bookingData, id: merchant_uid, status: 'PAID', paidAt: new Date().toISOString() };
    db.bookings.push(newBooking);
    await sendTelegram(`💳 <b>새 예약 발생</b>\n👤 ${newBooking.userName}\n🐾 ${newBooking.petName}\n💰 ${newBooking.totalCost.toLocaleString()}원`);
    return res.status(200).json({ success: true });
  }

  // 3. 결제 콜백
  if (path.includes('callback')) {
    const data = req.method === 'POST' ? req.body : req.query;
    const isSuccess = (data.res_cd || data.result) === '0000' || (data.res_cd || data.result) === 'success';
    const query = new URLSearchParams({ result: isSuccess ? 'success' : 'fail', orderno: data.orderno || data.ORDERNO || '' }).toString();
    res.writeHead(302, { Location: `/payment/callback?${query}` });
    return res.end();
=======
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
>>>>>>> eb423f517925f7b12f1d3f3e160c6f538480f8cc
  }
}
