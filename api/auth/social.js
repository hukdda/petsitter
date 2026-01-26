
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { provider, code, redirectUri } = req.body;
  // REST API 키
  const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || "4e82f00882c1c24d0b83c1e001adce2f";
  // 보안 설정의 Client Secret (설정 시 필수)
  const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET;

  if (!code) return res.status(400).json({ success: false, message: '인가 코드가 없습니다.' });

  try {
    // 1. 카카오 토큰 교환을 위한 파라미터 구성
    const tokenParams = {
      grant_type: 'authorization_code',
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: redirectUri,
      code: code
    };

    // Client Secret이 환경 변수에 있을 때만 추가
    if (KAKAO_CLIENT_SECRET) {
      tokenParams.client_secret = KAKAO_CLIENT_SECRET;
    }

    console.log('[DEBUG] Requesting Kakao Token with URI:', redirectUri);

    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams(tokenParams)
    });
    
    const tokenData = await tokenRes.json();
    
    if (!tokenRes.ok) {
      console.error('[ERROR] Kakao Token Exchange Failed:', tokenData);
      return res.status(401).json({ 
        success: false, 
        message: '카카오 토큰 발급에 실패했습니다.', 
        details: tokenData 
      });
    }

    // 2. 액세스 토큰으로 사용자 정보 가져오기
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

    // 3. 응답 데이터 정규화
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
    console.error('[FATAL] Internal Auth Error:', err);
    return res.status(500).json({ success: false, message: '서버 내부 오류', error: err.message });
  }
}
