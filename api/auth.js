
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { code, redirectUri } = req.body;
  const KAKAO_CLIENT_ID = process.env.KAKAO_CLIENT_ID || "4e82f00882c1c24d0b83c1e001adce2f";

  try {
    const tRes = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
      body: new URLSearchParams({ grant_type: 'authorization_code', client_id: KAKAO_CLIENT_ID, redirect_uri: redirectUri, code })
    });
    const tData = await tRes.json();
    const uRes = await fetch('https://kapi.kakao.com/v2/user/me', { headers: { Authorization: `Bearer ${tData.access_token}` } });
    const uData = await uRes.json();

    let phone = uData.kakao_account?.phone_number || '';
    if (phone) phone = phone.replace('+82 ', '0').replace(/-/g, '').replace(/\s/g, '').trim();

    return res.status(200).json({ 
      success: true, 
      user: { 
        name: uData.kakao_account?.name || uData.properties?.nickname || '사용자', 
        profileImg: uData.properties?.profile_image, 
        phone: phone 
      } 
    });
  } catch (e) { return res.status(500).json({ success: false, message: '인증 실패' }); }
}
