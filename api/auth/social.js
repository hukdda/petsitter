export default async function handler(req, res) {
  // 브라우저 보안(CORS) 허용
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const KAKAO_CLIENT_ID = "4e82f00882c1c24d0b83c1e001adce2f";
  const KAKAO_CLIENT_SECRET = "XX8Uw35cnlTEiBkSyrEiAdJD46vfhIrv"; // 🚨 카카오 개발자 센터 '보안' 탭의 Client Secret 값
  const REDIRECT_URI = "https://www.lovelypetsitter.com/callback";

  const { code } = req.query;

  // 코드가 없으면 로그인 주소 전달
  if (!code) {
    const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
    return res.status(200).json({ url: authUrl });
  }

  // 🚨 [여기가 핵심] 카카오 본사에서 최종 확인 도장 받기
  try {
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
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

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error("카카오 토큰 에러:", tokenData);
      return res.status(401).json({ success: false, error: tokenData.error_description });
    }

    // 사용자 정보 가져오기
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();

    return res.status(200).json({ 
      success: true, 
      user: { id: userData.id, nickname: userData.properties?.nickname } 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "서버 통신 오류" });
  }
}
