export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const data = { ...req.query, ...req.body };
  const { code } = data;
  
  // [수정] 접속한 도메인(www 유무 등)을 자동으로 파악하여 주소를 만듭니다.
  const host = req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const REDIRECT_URI = `${protocol}://${host}/api/auth/social`;
  
  const KAKAO_CLIENT_ID = "4e82f00882c1c24d0b83c1e001adce2f";

  if (!code) {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    return res.redirect(kakaoAuthUrl);
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: REDIRECT_URI, // 이제 카카오에 등록된 4개 중 하나와 자동으로 매칭됩니다.
      code: code
    });

    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: params
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      return res.status(401).json({ success: false, details: tokenData });
    }

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
