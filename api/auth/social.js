export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const data = { ...req.query, ...req.body };
  const { code } = data;
  
  const REDIRECT_URI = "https://www.lovelypetsitter.com/api/auth/social";
  const KAKAO_CLIENT_ID = "4e82f00882c1c24d0b83c1e001adce2f";
  
  // [범인 검거 완료] 사장님 캡처 화면에 있던 그 코드를 여기 넣었습니다!
  const KAKAO_CLIENT_SECRET = "XX8Uw35cnlTEiBkSyreIAdJD46vfhIrv"; 

  if (!code) {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    return res.redirect(kakaoAuthUrl);
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code: code,
      client_secret: KAKAO_CLIENT_SECRET // 이제 이 비밀번호가 카카오 문을 열어줄 겁니다.
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

    // 로그인 성공 시 사용자 정보 반환
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
