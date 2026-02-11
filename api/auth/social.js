export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const REDIRECT_URI = "https://www.lovelypetsitter.com/callback";
  const KAKAO_CLIENT_ID = "4e82f00882c1c24d0b83c1e001adce2f";
  const KAKAO_CLIENT_SECRET = "XX8Uw35cnlTEiBkSyrEiAdJD46vfhIrv"; 

  const { code } = req.query;

  // 🚨 여기서 redirect 대신 JSON을 보냅니다. (프론트엔드 fetch 대응)
  if (!code) {
    const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    return res.status(200).json({ needRedirect: true, url: authUrl });
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
    if (!tokenRes.ok) return res.status(401).json({ success: false, error: "token_error" });

    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();

    return res.status(200).json({ 
      success: true, 
      user: { id: userData.id, name: userData.properties?.nickname } 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
