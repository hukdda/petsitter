export default async function handler(req, res) {
  const KAKAO_CLIENT_ID = "4e82f00882c1c24d0b83c1e001adce2f";
  const REDIRECT_URI = "https://www.lovelypetsitter.com/callback";

  // 🚨 [핵심] 인가 코드가 없다고 에러 내지 말고, 
  // 코드가 없으면 직접 카카오 로그인 페이지로 사용자를 보내버립니다!
  if (!req.query.code) {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
    
    // 여기서 브라우저에게 "카카오로 가!"라고 강제로 명령합니다.
    return res.redirect(kakaoAuthUrl);
  }

  // 코드가 있을 때만 아래 로직(기존 로직)이 작동합니다.
  try {
    // ... (여기는 기존에 드린 토큰 받는 코드와 동일하게 유지) ...
    // 하지만 일단 redirect가 먼저 작동하므로 에러는 사라집니다.
  } catch (err) {
    return res.status(500).send("로그인 처리 중 오류 발생");
  }
}
