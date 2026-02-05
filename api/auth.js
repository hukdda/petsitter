// ✅ 외부 파일 의존성을 없애기 위해 Firebase 설정을 내부에 포함하거나 체크가 필요합니다.
// 만약 _db.js가 없어서 에러가 났던 거라면 아래 구조가 훨씬 안전합니다.

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  const { code, redirectUri } = req.body;
  // REST API 키는 보안을 위해 가급적 .env에 넣는 것이 좋지만, 일단 작동 확인을 위해 유지합니다.
  const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || "4e82f00882c1c24d0b83c1e001adce2f";

  if (!code) return res.status(400).json({ success: false, message: '인가 코드가 없습니다.' });

  try {
    // 1. 카카오 토큰 요청
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_CLIENT_ID,
        redirect_uri: redirectUri, // 프론트에서 보낸 redirectUri를 그대로 사용
        code: code
      })
    });
    
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error('카카오 토큰 에러:', tokenData);
      return res.status(401).json({ success: false, message: '토큰 발급 실패', details: tokenData });
    }

    // 2. 카카오 사용자 정보 요청
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();

    // 3. 사용자 객체 생성
    const user = {
      kakaoId: userData.id,
      name: userData.kakao_account?.profile?.nickname || userData.properties?.nickname || '사용자',
      profileImg: userData.properties?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.id}`,
      lastLogin: new Date().toISOString()
    };

    // 4. DB 저장 부분 (에러 방지를 위해 일단 try-catch로 감싸거나 잠시 주석 처리하여 로그인부터 확인 가능)
    try {
      const { firestore } = await import('./_db.js'); 
      await firestore.collection('users').doc(String(userData.id)).set(user, { merge: true });
    } catch (dbErr) {
      console.error('DB 저장 실패(무시하고 로그인 진행):', dbErr);
      // DB 저장이 실패해도 로그인 자체는 성공시키기 위해 에러를 던지지 않습니다.
    }

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('서버 최종 오류:', err);
    return res.status(500).json({ success: false, message: '서버 오류', error: err.message });
  }
}