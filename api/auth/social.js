export default async function handler(req, res) {
  const KAKAO_CLIENT_ID = "4e82f00882c1c24d0b83c1e001adce2f";
  const REDIRECT_URI = "https://www.lovelypetsitter.com/callback";

  // 🚨 인가 코드가 없으면 에러(400) 내지 말고, 즉시 카카오로 리다이렉트 시킵니다.
  if (!req.query.code) {
    const kakaoUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
    
    // 브라우저에게 "카카오로 이동해!"라고 명령
    res.writeHead(302, { Location: kakaoUrl });
    res.end();
    return;
  }

  // 코드가 있을 때만 이후 로직(토큰 받기) 실행...
}
