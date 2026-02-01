
// 서버리스 환경에서 데이터 유실을 막기 위해 텔레그램과 구글 시트로 즉시 전송합니다.
async function sendTelegram(env, msg) {
  const token = env.TELEGRAM_BOT_TOKEN || "7224856037:AAFI0xI30XyJ-pY1M-P5lRzH6fR9fXvYvYk";
  const chatId = env.TELEGRAM_CHAT_ID || "1028713025";
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' })
    });
  } catch (e) { console.error('Telegram Error:', e); }
}

async function recordToGoogleSheet(env, type, data) {
  const webhookUrl = env.GOOGLE_SHEET_WEBHOOK_URL || "";
  if (!webhookUrl) return;
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      body: JSON.stringify({ type, ...data, timestamp: new Date().toISOString() })
    });
  } catch (e) { console.error('Google Sheet Error:', e); }
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

// Mock 데이터 (영구 저장을 위해서는 구글 시트/KV/DB 연동이 필요하지만, 현재는 기본값 제공)
const MOCK_COMMENTS = [
  {
    id: 'c1',
    author: '이수진',
    region: '부산 해운대구',
    content: '여행 가는 동안 걱정이 많았는데, 시터님이 아이 사진도 자주 보내주시고 너무 정성껏 돌봐주셔서 감사했습니다. 다음에도 꼭 부탁드리고 싶어요!',
    profileImg: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SuJin',
    sitterName: '최지원 시터님',
    serviceType: '방문 돌봄 60분',
    relativeTime: '2일 전'
  },
  {
    id: 'c2',
    author: '박준형',
    region: '대구 수성구',
    content: '갑작스러운 출장으로 예약했는데, 당일 예약임에도 불구하고 너무 친절하게 대응해주셨어요. 아이가 시터님을 너무 좋아하는 게 사진으로도 느껴지네요.',
    profileImg: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jun',
    sitterName: '김민석 시터님',
    serviceType: '방문 돌봄 30분',
    relativeTime: '5일 전'
  }
];

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
    // 1. 후기 목록 조회 (GET)
    if (path === 'comments' && request.method === 'GET') {
      return jsonRes(MOCK_COMMENTS);
    }

    // 2. 후기 등록 (POST)
    if (path === 'comments' && request.method === 'POST') {
      const data = await request.json();
      const newComment = {
        ...data,
        id: `com_${Date.now()}`,
        profileImg: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.author}`,
        relativeTime: '방금 전',
        sitterName: '전문 시터님',
        serviceType: '방문 돌봄'
      };
      
      const msg = `💬 <b>새로운 후기 등록</b>\n작성자: ${data.author}\n지역: ${data.region}\n내용: ${data.content}`;
      await sendTelegram(env, msg);
      await recordToGoogleSheet(env, 'COMMENT', data);
      
      return jsonRes({ success: true, data: newComment });
    }

    // 3. 카카오 로그인
    if (path === 'auth/social' || path === 'kakao-auth') {
      const { code, redirectUri } = await request.json();
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
      if (!tokenRes.ok) return jsonRes({ success: false, message: '인증 에러', details: tokenData }, 401);

      const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });
      const userData = await userRes.json();
      
      return jsonRes({ 
        success: true, 
        user: {
          name: userData.properties?.nickname || '사용자',
          profileImg: userData.properties?.profile_image
        } 
      });
    }

    // 4. 펫시터 지원서 접수
    if (path === 'applications' && request.method === 'POST') {
      const data = await request.json();
      const msg = `🎖️ <b>신규 펫시터 지원</b>\n성함: ${data.name}\n연락처: ${data.phone}\n지역: ${data.address}\n경험: ${data.petExperience}`;
      await sendTelegram(env, msg);
      await recordToGoogleSheet(env, 'APPLICATION', data);
      return jsonRes({ success: true });
    }

    // 5. 무통장 입금 예약 접수
    if (path === 'verify-payment' && request.method === 'POST') {
      const { bookingData, amount } = await request.json();
      const msg = `🏦 <b>무통장 예약 접수</b>\n예약자: ${bookingData.userName} (${bookingData.userPhone})\n아이: ${bookingData.petName}\n금액: ${amount.toLocaleString()}원\n입금자: ${bookingData.depositorName}`;
      await sendTelegram(env, msg);
      await recordToGoogleSheet(env, 'BOOKING', { ...bookingData, amount });
      return jsonRes({ success: true });
    }

    // 6. 금액 계산
    if (path === 'calculate-price' && request.method === 'POST') {
      const { basePrice, startDate, endDate, petCount } = await request.json();
      const start = new Date(startDate);
      const end = new Date(endDate);
      let totalCost = 0; let days = 0;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days++;
        let daily = basePrice;
        if (d.getDay() === 0 || d.getDay() === 6) daily += 5000;
        totalCost += daily;
      }
      if (petCount > 1) totalCost += 5000 * (petCount - 1) * days;
      return jsonRes({ totalCost, totalDays: days, orderId: `ORD_${Date.now()}` });
    }

    return jsonRes({ message: 'API Not Found' }, 404);
  } catch (e) {
    return jsonRes({ error: e.message }, 500);
  }
}
