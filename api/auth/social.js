export default async function handler(req, res) {
  // 1. CORS 및 기본 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 2. 환경 설정 (사장님 카카오 정보)
  const REDIRECT_URI = "https://www.lovelypetsitter.com/callback";
  const KAKAO_CLIENT_ID = "4e82f00882c1c24d0b83c1e001adce2f";
  const KAKAO_CLIENT_SECRET = "XX8Uw35cnlTEiBkSyrEiAdJD46vfhIrv"; 

  const data = { ...req.query, ...req.body };
  const { code } = data;

  // 3. 인가 코드가 없으면 카카오 로그인창으로 강제 이동
  if (!code) {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    return res.redirect(kakaoAuthUrl);
  }

  try {
    // 4. 카카오 토큰 요청 (인가 코드를 실제 열쇠로 교환)
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

    // 토큰 발급 실패 시 에러 반환 (로그인 차단)
    if (!tokenRes.ok) {
      console.error('카카오 토큰 에러:', tokenData);
      return res.status(401).json({ success: false, message: '인증 실패', details: tokenData });
    }

    // 5. 발급된 토큰으로 카카오 사용자 정보 가져오기
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { 
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    });

    const userData = await userRes.json();

    // 6. [가장 중요] 사용자 ID가 없으면 비정상 접근으로 간주
    if (!userData.id) {
      return res.status(401).json({ success: false, message: '사용자 정보 확인 불가' });
    }

    // 7. 진짜 정보만 담아서 성공 응답
    return res.status(200).json({ 
      success: true, 
      user: {
        id: userData.id,
        name: userData.properties?.nickname || '사용자',
        profileImg: userData.properties?.profile_image || ''
      } 
    });

  } catch (err) {
    console.error('서버 내부 오류:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
