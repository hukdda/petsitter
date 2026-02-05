import { firestore } from './_db.js';

export default async function handler(req, res) {
  // 1. CORS 및 기본 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  const { code, redirectUri } = req.body;
  const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || "4e82f00882c1c24d0b83c1e001adce2f";

  if (!code) return res.status(400).json({ success: false, message: '인가 코드가 없습니다.' });

  try {
    // 2. 카카오 토큰 요청
    const tokenRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_CLIENT_ID,
        redirect_uri: redirectUri,
        code: code
      })
    });
    
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      return res.status(401).json({ success: false, message: '토큰 발급 실패', details: tokenData });
    }

    // 3. 카카오 사용자 정보 요청
    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();

    // 4. 저장할 사용자 데이터 정리
    const user = {
      kakaoId: userData.id,
      name: userData.kakao_account?.profile?.nickname || userData.properties?.nickname || '사용자',
      profileImg: userData.properties?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.id}`,
      lastLogin: new Date().toISOString()
    };

    // 5. DB 저장 (가장 차분하게 처리)
    try {
      if (firestore) {
        await firestore.collection('users').doc(String(userData.id)).set(user, { merge: true });
      }
    } catch (dbErr) {
      console.error('DB 저장 중 오류 발생:', dbErr);
      // DB 에러가 나도 로그인은 되게 하려면 여기서 멈추지 않습니다.
    }

    return res.status(200).json({ success: true, user });

  } catch (err) {
    console.error('서버 에러 발생:', err);
    return res.status(500).json({ success: false, message: '서버 내부 오류', error: err.message });
  }
}