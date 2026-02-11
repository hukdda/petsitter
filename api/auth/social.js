export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const REDIRECT_URI = "https://www.lovelypetsitter.com/callback";
  const KAKAO_CLIENT_ID = "4e82f00882c1c24d0b83c1e001adce2f";
  const KAKAO_CLIENT_SECRET = "XX8Uw35cnlTEiBkSyrEiAdJD46vfhIrv"; 

  const { code } = req.query;

  // 🚨 [수정] 직접 redirect 하지 않고, 프론트에 주소를 던져줍니다.
  if (!code) {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    
    // 브라우저가 이 응답을 받으면 직접 저 주소로 이동하게 됩니다.
    return res.status(200).json({ 
      success: false, 
      needRedirect: true, 
      url: kakaoAuthUrl 
    });
  }

  try {
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code: code,
        client_secret: KAKAO_CLIENT_SECRET
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
      user: {
        id: userData.id,
        name: userData.properties?.nickname || '사용자'
      } 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
