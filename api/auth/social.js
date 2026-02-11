export default async function handler(req, res) {
  // 1. 모든 접속 허용 (보안 완화하여 405 차단)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 2. 데이터 추출 (카카오 인가 코드를 받아냄)
  const data = { ...req.query, ...req.body };
  const { code } = data;

  // 3. 설정 (사장님 카카오 설정과 100% 일치)
  const REDIRECT_URI = "https://www.lovelypetsitter.com/api/auth/social";
  const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || "4e82f00882c1c24d0b83c1e001adce2f";

  // 인가 코드가 없으면 카카오 로그인 페이지로 보내버리기 (이게 안 돼서 QR이 안 뜬 겁니다)
  if (!code) {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    return res.redirect(kakaoAuthUrl);
  }

  try {
    // 4. 토큰 요청
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_CLIENT_ID,
        redirect_uri: REDIRECT_URI,
        code: code
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) return res.status(401).json({ success: false, details: tokenData });

    // 5. 사용자 정보 획득
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();

    // 6. 성공 시 메인 페이지로 이동 (쿠키나 토큰 처리는 일단 생략하고 성공 확인부터!)
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
