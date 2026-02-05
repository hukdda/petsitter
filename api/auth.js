import { firestore } from './_db.js'; // 👈 구글 DB 연결 추가

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method Not Allowed' });

  const { code, redirectUri } = req.body;
  const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || "4e82f00882c1c24d0b83c1e001adce2f";

  if (!code) return res.status(400).json({ success: false, message: '인가 코드가 없습니다.' });

  try {
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
    if (!tokenRes.ok) return res.status(401).json({ success: false, message: '토큰 발급 실패', details: tokenData });

    const userRes = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userData = await userRes.json();

    const user = {
      kakaoId: userData.id,
      name: userData.kakao_account?.name || userData.properties?.nickname || '사용자',
      profileImg: userData.properties?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.id}`,
      lastLogin: new Date().toISOString()
    };

    // ✅ [추가] 로그인한 사용자 정보를 구글 DB 'users' 컬렉션에 저장/업데이트
    await firestore.collection('users').doc(String(userData.id)).set(user, { merge: true });

    return res.status(200).json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: '서버 오류', error: err.message });
  }
}