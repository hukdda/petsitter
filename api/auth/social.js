export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { code } = req.query;

  // 1. 카카오에서 돌아온 코드가 없다면 다시 로그인창으로 보냄
  if (!code) {
    const KAKAO_CLIENT_ID = "4e82f00882c1c24d0b83c1e001adce2f";
    const REDIRECT_URI = "https://www.lovelypetsitter.com/callback";
    const url = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
    return res.status(200).json({ url });
  }

  // 2. 코드가 있다면 카카오 본사에 "이 사람 진짜 맞어?"라고 물어봄 (방법 B)
  try {
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: "4e82f00882c1c24d0b83c1e001adce2f",
        client_secret: "XX8Uw35cnlTEiBkSyrEiAdJD46vfhIrv", // 사장님 보안 키
        redirect_uri: "https://www.lovelypetsitter.com/callback",
        code
      })
    });

    const tokenData = await tokenResponse.json();
    
    // 성공하면 사용자 정보를 가져오고 세션을 만듭니다.
    return res.status(200).json({ success: true, user: tokenData });
  } catch (err) {
    return res.status(500).json({ error: "카카오 인증 실패" });
  }
}
