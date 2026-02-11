export default async function handler(req, res) {
  // 🚨 [핵심] CORS 보안 통과를 위해 모든 도메인 허용
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const KAKAO_CLIENT_ID = "4e82f00882c1c24d0b83c1e001adce2f";
  const KAKAO_CLIENT_SECRET = "XX8Uw35cnlTEiBkSyrEiAdJD46vfhIrv"; 
  const REDIRECT_URI = "https://www.lovelypetsitter.com/callback";

  const { code } = req.query;

  // 🚨 만약 code가 없으면 카카오로 보내줍니다.
  if (!code) {
    const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
    return res.redirect(authUrl);
  }

  // 🚨 code가 있으면 (지금 사장님 상황) 로그인을 마무리합니다.
  try {
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_CLIENT_ID,
        client_secret: KAKAO_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: code,
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) return res.status(401).json({ success: false, error: "토큰 실패" });

    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();

    // 🚨 성공 후 메인 페이지로 사용자 정보를 담아 보냅니다.
    // (이 부분이 가장 안전한 보안 방법 B의 핵심입니다)
    return res.status(200).json({ 
      success: true, 
      user: { id: userData.id, name: userData.properties?.nickname } 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
