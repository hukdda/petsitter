<<<<<<< HEAD

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
=======
import { db } from './_db.js';

export default async function handler(req, res) {
  // 1. CORS 및 기본 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  // GET 방식으로 들어왔을 때 405 에러가 아닌 안내 메시지를 줍니다.
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'POST 방식만 허용됩니다.' });
  }
>>>>>>> eb423f517925f7b12f1d3f3e160c6f538480f8cc

  const { code, redirectUri } = req.body;
  const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || "4e82f00882c1c24d0b83c1e001adce2f";

<<<<<<< HEAD
  try {
    // 1. 토큰 요청
    const tRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({ grant_type: 'authorization_code', client_id: KAKAO_CLIENT_ID, redirect_uri: redirectUri, code })
    });
    const tData = await tRes.json();
    
    if (!tRes.ok) throw new Error(tData.error_description || '토큰 발급 실패');

    // 2. 사용자 정보 요청
    const uRes = await fetch('https://kapi.kakao.com/v2/user/me', { 
      headers: { Authorization: `Bearer ${tData.access_token}` } 
    });
    const uData = await uRes.json();

    if (!uRes.ok) throw new Error('사용자 정보 획득 실패');

    // 3. 별명(nickname) 추출 로직 고도화
    // properties.nickname이 1순위, 그 다음 kakao_account.profile.nickname 참조
    const nickname = uData.properties?.nickname || uData.kakao_account?.profile?.nickname || '사용자';
    
    let phone = uData.kakao_account?.phone_number || '';
    if (phone) {
      phone = phone.replace('+82 ', '0').replace(/-/g, '').replace(/\s/g, '').trim();
    }

    return res.status(200).json({ 
      success: true, 
      user: { 
        id: uData.id,
        name: nickname, // 카카오 별명으로 설정
        profileImg: uData.properties?.profile_image || uData.kakao_account?.profile?.thumbnail_image_url, 
        phone: phone 
      } 
    });
  } catch (e) { 
    console.error('[AUTH_ERROR]', e);
    return res.status(500).json({ success: false, message: e.message || '인증 실패' }); 
  }
}
=======
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

    // 5. DB 저장 (이제 firestore 대신 db를 사용합니다)
    try {
      if (db) {
        // collection('users')에 사용자 정보를 저장하거나 업데이트합니다.
        await db.collection('users').doc(String(userData.id)).set(user, { merge: true });
        console.log(`✅ 유저 ${user.name} DB 저장 완료!`);
      }
    } catch (dbErr) {
      console.error('DB 저장 중 오류 발생:', dbErr);
    }

    return res.status(200).json({ success: true, user });

  } catch (err) {
    console.error('서버 에러 발생:', err);
    return res.status(500).json({ success: false, message: '서버 내부 오류', error: err.message });
  }
}
>>>>>>> eb423f517925f7b12f1d3f3e160c6f538480f8cc
