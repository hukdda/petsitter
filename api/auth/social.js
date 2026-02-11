export default async function handler(req, res) {
  // 1. 보안을 위한 기본 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 2. 사장님이 주신 정보를 정확히 입력했습니다.
  const KAKAO_CLIENT_ID = "4e82f00882c1c24d0b83c1e001adce2f";
  const KAKAO_CLIENT_SECRET = "XX8Uw35cnlTEiBkSyrEiAdJD46vfhIrv"; // 사장님이 주신 키
  const REDIRECT_URI = "https://www.lovelypetsitter.com/callback"; // 사장님이 주신 주소

  // 3. 카카오가 보내준 인가 코드(code) 확인
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ success: false, message: "인가 코드가 없습니다." });
  }

  try {
    // 4. [방법 B의 핵심] 카카오 본사에 가서 토큰 받아오기
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
      return res.status(401).json({ success: false, error: "토큰 교환 실패", details: tokenData });
    }

    // 5. 받아온 토큰으로 사용자 프로필 가져오기
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { 
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    });

    const userData = await userRes.json();

    // 6. 성공! 사장님께 사용자 정보를 돌려줍니다.
    return res.status(200).json({ 
      success: true, 
      user: {
        id: userData.id,
        name: userData.properties?.nickname || '사용자',
        profileImg: userData.properties?.profile_image || ''
      } 
    });

  } catch (err) {
    console.error("서버 내부 오류:", err);
    return res.status(500).json({ success: false, error: "서버 내부 오류 발생" });
  }
}
