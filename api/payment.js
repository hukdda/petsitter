import { db } from './_db.js';

async function sendTelegram(msg) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7224856037:AAFI0xI30XyJ-pY1M-P5lRzH6fR9fXvYvYk";
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "1028713025";
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'HTML' })
    });
    return response.ok;
  } catch (e) { 
    console.error('[TELEGRAM_ERROR]', e);
    return false; 
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const path = req.url.split('?')[0];

  // 1. 카드 수기결제
  if (path.includes('card-sugi')) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
    
    const { amount, cardNumber, cardExpiry, installment, cardAuth, cardPassword, productName, bookingData } = req.body;
    const USERID = process.env.NEXPAY_USERID || "DA77436573";
    const API_KEY = process.env.NEXPAY_KEY || "AIyW5KfZL0TDU)sH";
    const TOKEN_URL = 'https://develop.nex-pay.co.kr/nexpay/Api';

    try {
      console.log('[SUGI_STEP1] Token Request');
      const tokenRes = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY },
        body: JSON.stringify({ USERID, Type: 'CARD' })
      });
      
      const tokenData = await tokenRes.json();
      if (tokenData.code !== '0000') {
        throw new Error(`토큰 발급 실패: ${tokenData.msg}`);
      }

      const { ReturnURL, TOKEN } = tokenData;

      const payRes = await fetch(ReturnURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': API_KEY, 'TOKEN': TOKEN },
        body: JSON.stringify({
          USERID,
          PAYMETHOD: 'CARD-SUGI',
          p_price: String(amount),
          card_num: cardNumber.replace(/\s/g, ''),
          card_useable: cardExpiry.replace(/\//g, ''),
          installment: String(installment || '00').padStart(2, '0'),
          CARD_AUTH: cardAuth,
          PASSWD: cardPassword,
          p_product_name: productName || '펫시터 방문 돌봄'
        })
      });

      const payResult = await payRes.json();

      if (payResult.code === '0000') {
        const newBooking = {
          ...bookingData,
          id: payResult.order_number || `SUGI_${Date.now()}`,
          status: 'PAID',
          paidAt: new Date().toISOString(),
          paymentMethod: 'CARD_SUGI',
          totalCost: Number(amount)
        };
        
        db.bookings.push(newBooking);

        const msg = `💳 <b>[수기결제 성공]</b>

👤 예약자: ${newBooking.userName} (${newBooking.userPhone})
🛠 서비스: ${newBooking.serviceName}
💰 금액: ${Number(amount).toLocaleString()}원
💳 카드사: ${payResult.card_company || '확인불가'}
🧾 승인번호: <code>${payResult.a_number}</code>`;
        
        await sendTelegram(msg);
        return res.status(200).json({ success: true, data: payResult });
      } else {
        console.error('[SUGI_PAY_FAIL]', payResult);
        return res.status(400).json({ success: false, message: payResult.msg || '결제 승인 거절' });
      }
    } catch (error) {
      console.error('[SUGI_ERROR]', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // 2. 일반 결제 검증
  if (path.includes('verify')) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
    
    const { merchant_uid, bookingData } = req.body;
    const newBooking = { 
      ...bookingData, 
      id: merchant_uid, 
      status: 'PAID', 
      paidAt: new Date().toISOString() 
    };
    
    db.bookings.push(newBooking);
    
    await sendTelegram(`🎉 <b>새 예약 발생</b>

👤 ${newBooking.userName}
🐾 ${newBooking.petName}
💰 ${newBooking.totalCost.toLocaleString()}원`);
    
    return res.status(200).json({ success: true });
  }

  // 3. 결제 콜백
  if (path.includes('callback')) {
    const data = req.method === 'POST' ? req.body : req.query;
    const isSuccess = (data.res_cd || data.result) === '0000' || (data.res_cd || data.result) === 'success';
    const query = new URLSearchParams({ 
      result: isSuccess ? 'success' : 'fail', 
      orderno: data.orderno || data.ORDERNO || '' 
    }).toString();
    
    res.writeHead(302, { Location: `/payment/callback?${query}` });
    return res.end();
  }

  return res.status(404).json({ message: 'Endpoint not found' });
}
