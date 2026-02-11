export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const KAKAO_CLIENT_ID = "4e82f00882c1c24d0b83c1e001adce2f";
  const REDIRECT_URI = "https://www.lovelypetsitter.com/callback";

  const { code } = req.query;

  // 1. 코드가 없으면 카카오 로그인창 주소 알려주기
  if (!code) {
    const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
    return res.status(200).json({ url: authUrl });
  }

  // 2. 코드가 있으면 (QR코드 찍은 후) 최종 확인
  try {
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code: code,
        // 🚨 여기에서 client_secret 항목을 아예 뺐습니다! 
        // 이렇게 하면 카카오 설정에서 보안키를 안 켰어도 로그인이 됩니다.
      })
    });

    const tokenData = await tokenRes.json();
    
    if (!tokenRes.ok) {
      return res.status(401).json({ success: false, error: "토큰 인증 실패" });
    }

    // 3. 사용자 정보 가져오기
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();

    return res.status(200).json({ 
      success: true, 
      user: { nickname: userData.properties?.nickname } 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: "서버 통신 오류" });
  }
}
