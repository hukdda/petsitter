export default async function handler(req, res) {
  // 헤더 설정 (사장님 사이트 전용)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const REDIRECT_URI = "https://www.lovelypetsitter.com/callback";
  const KAKAO_CLIENT_ID = "4e82f00882c1c24d0b83c1e001adce2f";
  const KAKAO_CLIENT_SECRET = "XX8Uw35cnlTEiBkSyrEiAdJD46vfhIrv"; 

  const { code } = req.query;

  // 1단계: 인가 코드 체크 (없으면 카카오로 강제 이송)
  if (!code) {
    const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    return res.redirect(authUrl); 
  }

  try {
    // 2단계: 카카오 토큰 교환 (인가 코드가 진짜인지 검증)
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
    if (!tokenRes.ok) return res.status(401).json({ success: false, error: "Token Exchange Failed" });

    // 3단계: 사용자 정보 수신 (진짜 로그인 성공 여부 결정)
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();

    if (!userData.id) return res.status(401).json({ success: false, error: "Invalid User Info" });

    return res.status(200).json({ 
      success: true, 
      user: { id: userData.id, name: userData.properties?.nickname } 
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: "Server Error" });
  }
}
