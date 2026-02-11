export default async function handler(req, res) {
  // 1. CORS 및 헤더 설정 (GET, POST 모두 허용)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 프리플라이트(OPTIONS) 요청 처리
  if (req.method === 'OPTIONS') return res.status(200).end();

  // 2. 요청 방식 체크 (405 에러 방지)
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // 3. 데이터 추출 (GET은 query에서, POST는 body에서)
  const data = req.method === 'GET' ? req.query : req.body;
  const { code } = data;

  // 4. [중요] 카카오 설정과 100% 일치해야 하는 Redirect URI
  // 사장님의 카카오 설정창에 이 주소가 반드시 'Redirect URI'로 등록되어 있어야 합니다.
  const redirectUri = "https://www.lovelypetsitter.com/api/auth/social";

  const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || "4e82f00882c1c24d0b83c1e001adce2f";
  const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET;

  if (!code) {
    return res.status(400).json({ success: false, message: '인가 코드가 없습니다.' });
  }

  try {
    // 5. 카카오 토큰 요청 데이터 준비
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: redirectUri,
      code: code
    });

    if (KAKAO_CLIENT_SECRET) {
      tokenParams.append('client_secret', KAKAO_CLIENT_SECRET);
    }

    // 6. 카카오 서버로 토큰 요청
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: tokenParams
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

    // 7. 발급받은 토큰으로 사용자 정보 가져오기
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { 
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    });
    
    const userData = await userRes.json();

    if (!userRes.ok) {
      return res.status(401).json({ success: false, message: '사용자 정보 획득 실패' });
    }

    // 8. 최종 결과 반환
    return res.status(200).json({ 
      success: true, 
      user: { 
        id: userData.id,
        name: userData.properties?.nickname || '사용자', 
        profileImg: userData.properties?.profile_image || '',
        email: userData.kakao_account?.email || ''
      } 
    });

  } catch (err) {
    console.error('[FATAL] Auth Error:', err);
    return res.status(500).json({ success: false, message: '서버 오류 발생', error: err.message });
  }
}
