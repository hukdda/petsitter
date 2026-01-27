
const db = {
  comments: [],
  applications: [],
  bookings: []
};

// 텔레그램 알림 전송 함수
async function sendTelegram(env, msg) {
  const token = env.TELEGRAM_BOT_TOKEN || "7224856037:AAFI0xI30XyJ-pY1M-P5lRzH6fR9fXvYvYk";
  const chatId = env.TELEGRAM_CHAT_ID || "1028713025";
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' })
    });
  } catch (e) {
    console.error('Telegram Error:', e);
  }
}

const jsonRes = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 
    'Content-Type': 'application/json', 
    'Access-Control-Allow-Origin': '*', 
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 
    'Access-Control-Allow-Headers': 'Content-Type' 
  }
});

export async function onRequest(context) {
  const { request, env, params } = context;
  const path = params.path ? params.path.join('/') : '';
  const KAKAO_CLIENT_ID = env.KAKAO_CLIENT_ID || "4e82f00882c1c24d0b83c1e001adce2f";

  if (request.method === 'OPTIONS') return new Response(null, { 
    headers: { 
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 
      'Access-Control-Allow-Headers': 'Content-Type' 
    } 
  });

  try {
    // --- 1. 카카오 로그인 처리 (복구된 핵심 로직) ---
    if (path === 'auth/social' || path === 'kakao-auth') {
      const { code, redirectUri } = await request.json();
      if (!code) return jsonRes({ success: false, message: '인가 코드가 없습니다.' }, 400);

      // 토큰 교환
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
      if (!tokenRes.ok) return jsonRes({ success: false, message: '토큰 발급 실패', details: tokenData }, 401);

      // 사용자 정보 획득
      const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const userData = await userRes.json();
      if (!userRes.ok) return jsonRes({ success: false, message: '정보 획득 실패' }, 401);

      let phone = userData.kakao_account?.phone_number || '';
      if (phone) phone = phone.replace('+82 ', '0').replace(/-/g, '').replace(/\s/g, '').trim();

      return jsonRes({ 
        success: true, 
        user: {
          id: userData.id,
          name: userData.kakao_account?.name || userData.properties?.nickname || '사용자',
          profileImg: userData.properties?.profile_image,
          phone: phone,
          email: userData.kakao_account?.email || ''
        } 
      });
    }

    // --- 2. 금액 계산 (명절 할증 포함) ---
    if (path === 'calculate-price' && request.method === 'POST') {
      const { basePrice, startDate, endDate, petCount, visitTime } = await request.json();
      const kstNow = new Date(new Date().getTime() + (9 * 60 * 60 * 1000));
      const todayStr = kstNow.toISOString().split('T')[0];
      const start = new Date(`${startDate}T00:00:00Z`);
      const end = new Date(`${endDate}T00:00:00Z`);
      const surcharges = new Set();
      let totalCost = 0; let totalDays = 0;

      const HOLIDAYS = [
        '2025-01-25', '2025-01-26', '2025-01-27', '2025-01-28', '2025-01-29', '2025-01-30',
        '2025-03-01', '2025-05-05', '2025-06-06', '2025-08-15', '2025-10-03', '2025-10-04', '2025-10-05',
        '2025-10-06', '2025-10-07', '2025-10-08', '2025-10-09', '2025-12-25',
        '2026-02-14', '2026-02-15', '2026-02-16', '2026-02-17', '2026-02-18'
      ];

      for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
        totalDays++; let daily = basePrice;
        const dStr = d.toISOString().split('T')[0];
        if (HOLIDAYS.includes(dStr)) { daily += 10000; surcharges.add('명절 할증 (+1.0만)'); }
        else if (d.getUTCDay() === 0 || d.getUTCDay() === 6) { daily += 5000; surcharges.add('주말 할증 (+0.5만)'); }
        totalCost += daily;
      }
      if (startDate === todayStr) { totalCost += 10000; surcharges.add('당일 긴급 (+1.0만)'); }
      if (petCount > 1) { totalCost += 5000 * (petCount - 1) * totalDays; surcharges.add('다견/다묘 할증'); }

      return jsonRes({ totalCost, totalDays, surcharges: Array.from(surcharges), orderId: `PET_${Date.now()}` });
    }

    // --- 3. 예약 확정 및 알림 ---
    if (path === 'verify-payment' && request.method === 'POST') {
      const body = await request.json();
      const { paymentMethod, bookingData, amount } = body;
      const methodText = paymentMethod === 'BANK' ? '🏦 무통장 입금' : '💳 카드 간편결제';
      const statusText = paymentMethod === 'BANK' ? '<b>[입금 대기]</b>' : '<b>[결제 완료]</b>';
      
      const msg = `
${methodText} <b>새 예약 발생</b>
👤 예약자: ${bookingData.userName} (${bookingData.userPhone})
🐾 아이: ${bookingData.petName} (${bookingData.petBreed})
📅 일정: ${bookingData.startDate} ~ ${bookingData.endDate}
💰 금액: ${amount.toLocaleString()}원
상태: ${statusText}
      `.trim();

      await sendTelegram(env, msg);
      return jsonRes({ success: true });
    }

    return jsonRes({ message: 'API Path Not Found: ' + path }, 404);
  } catch (e) {
    return jsonRes({ error: e.message }, 500);
  }
}
