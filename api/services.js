import { db } from './_db.js';

// --- 텔레그램 알림 함수 ---
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
  } catch (e) { return false; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  // 🚨 [핵심] 삭제한 social.js의 역할을 여기서 대신 수행합니다.
  // 주소에 'auth/social'이 포함되어 있으면 로그인 로직 가동!
  if (path.includes('auth/social')) {
    const data = { ...req.query, ...req.body };
    const { code } = data;
    const REDIRECT_URI = "https://www.lovelypetsitter.com/api/auth/social";
    const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || "4e82f00882c1c24d0b83c1e001adce2f";

    if (!code) return res.status(400).json({ success: false, message: '인가 코드가 없습니다.' });

    try {
      const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: KAKAO_CLIENT_ID,
          redirect_uri: REDIRECT_URI,
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

  // --- 기존 가격 계산 로직 (calculate-price) ---
  if (path.includes('calculate-price')) {
    // ... (사장님의 기존 가격 계산 코드를 여기에 그대로 두세요) ...
    // 제가 위에 드린 '카카오 로그인 처리부' 바로 뒤에 오면 됩니다.
    try {
      const { basePrice, startDate, endDate, petCount, visitTime } = req.body;
      // (이하 생략 - 사장님 기존 코드 유지)
      return res.status(200).json({ totalCost: 0 }); // 예시
    } catch (e) { return res.status(500).end(); }
  }

  return res.status(404).json({ message: 'Endpoint not found' });
}
