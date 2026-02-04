
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const allKeys = Object.keys(process.env);
  const findEnv = (target) => {
    const key = allKeys.find(k => 
      k.trim().toUpperCase() === target.toUpperCase() || 
      k.trim().toUpperCase().includes(target.toUpperCase())
    );
    return key ? process.env[key].trim() : null;
  };

  const BOT_TOKEN = findEnv('TELEGRAM_BOT_TOKEN') || findEnv('BOT_TOKEN');
  const CHAT_ID = findEnv('TELEGRAM_CHAT_ID') || findEnv('CHAT_ID');

  let botInfo = { username: 'unknown', first_name: '연결되지 않음' };
  
  if (BOT_TOKEN) {
    try {
      const meRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe?t=${Date.now()}`);
      const meData = await meRes.json();
      if (meData.ok) {
        botInfo = meData.result;
      } else {
        return res.status(401).json({ 
          success: false, 
          message: "입력된 봇 토큰이 유효하지 않습니다. (Invalid Token)",
          errorType: "INVALID_TOKEN",
          diagnose: { BOT_TOKEN_LOADED: true, CHAT_ID_LOADED: !!CHAT_ID }
        });
      }
    } catch (e) {
      console.error('getMe Error', e);
    }
  }

  const diagnose = {
    BOT_TOKEN_LOADED: !!BOT_TOKEN,
    CHAT_ID_LOADED: !!CHAT_ID,
    RAW_CHAT_ID: CHAT_ID,
    CONNECTED_BOT_USERNAME: botInfo.username,
    CONNECTED_BOT_NAME: botInfo.first_name,
    SERVER_TIME: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
  };

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(400).json({ 
      success: false, 
      message: "환경 변수 설정이 누락되었습니다.",
      diagnose
    });
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: `🚀 <b>[연결 성공]</b>\n\n봇 이름: ${botInfo.first_name}(@${botInfo.username})\n수신 ID: ${CHAT_ID}\n시각: ${diagnose.SERVER_TIME}`,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      return res.status(200).json({ success: true, diagnose, details: data });
    } else {
      let errorType = "TELEGRAM_ERROR";
      let message = data.description;
      
      if (data.description.includes('chat not found')) {
        errorType = "CHAT_NOT_FOUND";
        message = `사용자(${CHAT_ID})를 찾을 수 없습니다. 봇(@${botInfo.username})에게 말을 먼저 걸어주세요.`;
      }

      return res.status(400).json({ 
        success: false, 
        message, 
        errorType,
        diagnose, 
        telegramRaw: data 
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message, diagnose });
  }
}
