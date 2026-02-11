export default async function handler(req, res) {
  // CORS 허용 (브라우저가 서버에 접속할 수 있게 문 열기)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const KAKAO_CLIENT_ID = "4e82f00882c1c24d0b83c1e001adce2f";
  // 🚨 [매우 중요] 카카오 개발자 센터 -> 카카오 로그인 -> 보안 -> Client Secret 값을 여기에 넣으세요!
  const KAKAO_CLIENT_SECRET = "여기에_카카오에서_받은_보안키를_넣으세요"; 
  const REDIRECT_URI = "https://www.lovelypetsitter.com/callback";

  const { code } = req.query;

  // 코드가 없으면 로그인 주소부터 알려주기
  if (!code) {
    const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
    return res.status(200).json({ url: authUrl });
  }

  // 코드가 있으면 (QR코드 찍은 후) 카카오 본사에 확인 요청 (방법 B)
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
    
    if (!tokenRes.ok) {
      return res.status(401).json({ success: false, error: tokenData.error_description });
    }

    // 성공! 사용자 닉네임 가져오기
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();

    return res.status(200).json({ 
      success: true, 
      user: { nickname: userData.properties?.nickname } 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "서버 통신 실패" });
  }
}
