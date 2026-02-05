
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { code, redirectUri } = req.body;
  const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || "4e82f00882c1c24d0b83c1e001adce2f";

  try {
    // 1. 토큰 요청
    const tRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({ grant_type: 'authorization_code', client_id: KAKAO_CLIENT_ID, redirect_uri: redirectUri, code })
    });
    const tData = await tRes.json();
    
    if (!tRes.ok) throw new Error(tData.error_description || '토큰 발급 실패');

    // 2. 사용자 정보 요청
    const uRes = await fetch('https://kapi.kakao.com/v2/user/me', { 
      headers: { Authorization: `Bearer ${tData.access_token}` } 
    });
    const uData = await uRes.json();

    if (!uRes.ok) throw new Error('사용자 정보 획득 실패');

    // 3. 별명(nickname) 추출 로직 고도화
    // properties.nickname이 1순위, 그 다음 kakao_account.profile.nickname 참조
    const nickname = uData.properties?.nickname || uData.kakao_account?.profile?.nickname || '사용자';
    
    let phone = uData.kakao_account?.phone_number || '';
    if (phone) {
      phone = phone.replace('+82 ', '0').replace(/-/g, '').replace(/\s/g, '').trim();
    }

    return res.status(200).json({ 
      success: true, 
      user: { 
        id: uData.id,
        name: nickname, // 카카오 별명으로 설정
        profileImg: uData.properties?.profile_image || uData.kakao_account?.profile?.thumbnail_image_url, 
        phone: phone 
      } 
    });
  } catch (e) { 
    console.error('[AUTH_ERROR]', e);
    return res.status(500).json({ success: false, message: e.message || '인증 실패' }); 
  }
}
