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
    return false; 
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const path = req.url.split('?')[0];

  // 1. 관리자 데이터 조회
  if (path.includes('data')) {
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

    try {
      const totalRevenue = db.bookings.reduce((acc, curr) => acc + (curr.totalCost || 0), 0);
      const totalBookings = db.bookings.length;
      const totalApps = db.applications.length;

      const sortedBookings = [...db.bookings].sort((a, b) => 
        new Date(b.createdAt || b.paidAt).getTime() - new Date(a.createdAt || a.paidAt).getTime()
      );
      
      const sortedApps = [...db.applications].sort((a, b) => 
        new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
      );

      return res.status(200).json({
        success: true,
        bookings: sortedBookings,
        applications: sortedApps,
        comments: db.comments,
        stats: { totalRevenue, totalBookings, totalApps }
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 2. API 상태 체크
  if (path.includes('check-api')) {
    const results = {
      vercel: 'ONLINE',
      time: new Date().toISOString(),
      config: {
        has_userid: !!process.env.NEXPAY_USERID,
        has_key: !!process.env.NEXPAY_KEY
      },
      external: {
        prod_api: 'checking',
        mag_test_api: 'checking',
        dev_api: 'checking'
      }
    };

    try {
      const pRes = await fetch('https://nex-pay.co.kr/nexpay/Api', { method: 'HEAD' });
      results.external.prod_api = pRes.ok ? 'ONLINE' : 'ERROR_' + pRes.status;
    } catch (e) {
      results.external.prod_api = 'UNREACHABLE';
    }

    try {
      const mRes = await fetch('http://develop.nex.magnexpay.com/nexpay/Api', { method: 'HEAD' });
      results.external.mag_test_api = mRes.ok ? 'ONLINE' : 'ERROR_' + mRes.status;
    } catch (e) {
      results.external.mag_test_api = 'UNREACHABLE';
    }

    try {
      const dRes = await fetch('https://develop.nex-pay.co.kr/nexpay/Api', { method: 'HEAD' });
      results.external.dev_api = dRes.ok ? 'ONLINE' : 'ERROR_' + dRes.status;
    } catch (e) {
      results.external.dev_api = 'UNREACHABLE';
    }
    
    return res.status(200).json(results);
  }

  // 3. 텔레그램 테스트
  if (path.includes('test-telegram')) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
    
    const result = await sendTelegram('🚀 <b>[연결 성공]</b>\n\n텔레그램 알림이 정상 작동합니다.');
    return res.status(200).json({ success: result });
  }

  return res.status(404).json({ message: 'Endpoint not found' });
}
