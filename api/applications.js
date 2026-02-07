import { db } from './_db.js';

async function sendTelegram(message) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7224856037:AAFI0xI30XyJ-pY1M-P5lRzH6fR9fXvYvYk";
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "1028713025";
  
  if (!BOT_TOKEN || !CHAT_ID) return;

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'HTML' })
    });
  } catch (err) {
    console.error('[TELEGRAM_ERROR]', err);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const application = {
      ...req.body,
      id: `app_${Date.now()}`,
      appliedAt: new Date().toISOString()
    };
    db.applications.push(application);
    
    const msg = `🎖️ <b>신규 전문가 지원서</b>

👤 성함: ${application.name}
📞 연락처: ${application.phone}
📍 지역: ${application.address}
💬 지원동기: ${application.motivation?.substring(0, 100)}...`;
    
    await sendTelegram(msg);
    
    return res.status(200).json({ success: true, data: application });
  } catch (err) {
    return res.status(500).json({ success: false, message: '서버 오류' });
  }
}
