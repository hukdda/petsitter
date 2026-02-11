export default async function handler(req, res) {
  // CORS 설정: 외부 요청 허용
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 프리플라이트 요청 처리
  if (req.method === 'OPTIONS') return res.status(200).end();

  // [수정 포인트 1] GET과 POST 방식을 모두 허용하여 405 에러 방지
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: '허용되지 않는 요청 방식입니다. (GET/POST만 가능)' });
  }

  // [수정 포인트 2] 요청 방식에 따라 데이터를 가져오는 위치 변경
  // GET이면 URL 파라미터(req.query)에서, POST면 본문(req.body)에서 가져옴
  const { provider, code, redirectUri } = req.method === 'GET' ? req.query : req.body;

  const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || "4e82f00882c1c24d0b83c1e001adce2f";
  const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET;

  if (!code) {
    return res.status(400).json({ success: false, message: '인가 코드가 없습니다.' });
  }

  try {
    const tokenParams = {
      grant_type: 'authorization_code',
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: redirectUri,
      code: code
    };

    if (KAKAO_CLIENT_SECRET) {
      tokenParams.client_secret = KAKAO_CLIENT_SECRET;
    }

    console.log('[DEBUG] Kakao Token Request with URI:', redirectUri);

    // 카카오 토큰 발급 요청
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams(tokenParams)
    });
    
    const tokenData = await tokenRes.json();
    
    if (!tokenRes.ok) {
      console.error('[ERROR] Kakao Token Failed:', tokenData);
      return res.status(401).json({ 
        success: false, 
        message: '카카오 토큰 발급 실패', 
        details: tokenData 
      });
    }

    // 사용자 정보 가져오기
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { 
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    });
    
    const userData = await userRes.json();

    if (!userRes.ok) {
      return res.status(401).json({ success: false, message: '사용자 정보 획득 실패', details: userData });
    }

    // 사용자 정보 정리 (닉네임, 프로필 사진 등)
    const nickname = userData.properties?.nickname || userData.kakao_account?.profile?.nickname || '사용자';
    const profileImg = userData.properties?.profile_image || userData.kakao_account?.profile?.thumbnail_image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.id}`;

    return res.status(200).json({ 
      success: true, 
      user: { 
        id: userData.id,
        name: nickname, 
        profileImg: profileImg,
        email: userData.kakao_account?.email || ''
      } 
    });

  } catch (err) {
    console.error('[FATAL] Auth Error:', err);
    return res.status(500).json({ success: false, message: '서버 내부 오류 발생', error: err.message });
  }
}
