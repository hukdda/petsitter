
import { db } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const path = req.url.split('?')[0];

  if (path.includes('data')) {
    const totalRevenue = db.bookings.reduce((acc, curr) => acc + (curr.totalCost || 0), 0);
    return res.status(200).json({ success: true, bookings: [...db.bookings].reverse(), applications: [...db.applications].reverse(), stats: { totalRevenue, totalBookings: db.bookings.length, totalApps: db.applications.length } });
  }

  if (path.includes('check-api')) {
    return res.status(200).json({ vercel: 'ONLINE', time: new Date().toISOString(), external: { prod_api: 'ONLINE', mag_test_api: 'ONLINE' } });
  }

  if (path.includes('test-telegram')) {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7224856037:AAFI0xI30XyJ-pY1M-P5lRzH6fR9fXvYvYk";
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "1028713025";
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: CHAT_ID, text: `🚀 <b>[연결 성공]</b>`, parse_mode: 'HTML' }) });
    return res.status(200).json({ success: response.ok });
  }
}
