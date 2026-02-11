export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const data = { ...req.query, ...req.body };
  const { code } = data;
  
  // 🚨 [수정] 에러 메시지에 나온 주소와 토씨 하나 안 틀리게 맞췄습니다.
  const REDIRECT_URI = "https://www.lovelypetsitter.com/callback";
  const KAKAO_CLIENT_ID = "4e82f00882c1c24d0b83c1e001adce2f";
  const KAKAO_CLIENT_SECRET = "XX8Uw35cnlTEiBkSyrEiAdJD46vfhIrv"; 

  if (!code) {
    // 코드가 없으면 카카오 로그인창으로 보낼 때도 동일한 주소를 사용합니다.
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    return res.redirect(kakaoAuthUrl);
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: REDIRECT_URI, // 카카오가 요구하는 그 주소!
      code: code,
      client_secret: KAKAO_CLIENT_SECRET
    });

    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: params
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) return res.status(401).json({ success: false, details: tokenData });

    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();

    return res.status(200).json({ 
      success: true, 
      user: {
        id: userData.id,
        name: userData.properties?.nickname || '사용자',
        profileImg: userData.properties?.profile_image || ''
      } 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
