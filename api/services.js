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

  // --- [추가] 카카오 로그인 처리 로직 ---
  if (path.includes('auth/social')) {
    const data = req.method === 'GET' ? req.query : req.body;
    const { code } = data;
    const redirectUri = "https://www.lovelypetsitter.com/api/auth/social";
    const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || "4e82f00882c1c24d0b83c1e001adce2f";

    if (!code) return res.status(400).json({ success: false, message: '인가 코드가 없습니다.' });

    try {
      const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: KAKAO_CLIENT_ID,
          redirect_uri: redirectUri,
          code: code
        })
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) return res.status(401).json({ success: false, details: tokenData });

      const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const userData = await userRes.json();

      return res.status(200).json({ 
        success: true, 
        user: { id: userData.id, name: userData.properties?.nickname || '사용자' } 
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  // --- 기존 가격 계산 로직 ---
  if (path.includes('calculate-price')) {
    try {
      const { basePrice, startDate, endDate, petCount, visitTime } = req.body;
      const start = new Date(`${startDate}T00:00:00Z`);
      const end = new Date(`${endDate}T00:00:00Z`);
      const now = new Date();
      const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
      const todayStr = kstNow.toISOString().split('T')[0];
      
      const surcharges = new Set();
      let totalCost = 0;
      let totalDays = 0;

      const BIG_HOLIDAYS = ['2025-01-25', '2025-01-26', '2025-01-27', '2025-01-28', '2025-01-29', '2025-01-30'];
      
      let d = new Date(start);
      while (d <= end) {
        totalDays++;
        let dailyCost = basePrice;
        const dateStr = d.toISOString().split('T')[0];
        if (BIG_HOLIDAYS.includes(dateStr)) {
          dailyCost += 10000;
          surcharges.add('명절 할증 (+1.0만)');
        }
        totalCost += dailyCost;
        d.setUTCDate(d.getUTCDate() + 1);
      }

      return res.status(200).json({ 
        totalCost, 
        totalDays, 
        surcharges: Array.from(surcharges),
        orderId: `ORD_${Date.now().toString(36).toUpperCase()}` 
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: '금액 계산 중 오류' });
    }
  }

  return res.status(404).json({ message: 'Endpoint not found' });
}
