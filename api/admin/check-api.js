
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const results = {
    vercel: 'ONLINE',
    time: new Date().toISOString(),
    config: {
      has_userid: !!process.env.NEXPAY_USERID,
      has_key: !!process.env.NEXPAY_KEY
    },
    external: {
      prod_api: 'checking',
      mag_test_api: 'checking',
      dev_api: 'checking'
    }
  };

  // 1. 넥스페이 운영 서버 체크
  try {
    const pRes = await fetch('https://nex-pay.co.kr/nexpay/Api', { method: 'HEAD', timeout: 3000 });
    results.external.prod_api = pRes.ok ? 'ONLINE' : 'ERROR_' + pRes.status;
  } catch (e) {
    results.external.prod_api = 'UNREACHABLE';
  }

  // 2. 채팅방에서 언급된 새로운 테스트 서버 체크 (매우 중요)
  try {
    const mRes = await fetch('http://develop.nex.magnexpay.com/nexpay/Api', { method: 'HEAD', timeout: 3000 });
    results.external.mag_test_api = mRes.ok ? 'ONLINE' : 'ERROR_' + mRes.status;
  } catch (e) {
    results.external.mag_test_api = 'UNREACHABLE';
  }

  // 3. 기존 개발 서버 체크
  try {
    const dRes = await fetch('https://develop.nex-pay.co.kr/nexpay/Api', { method: 'HEAD', timeout: 3000 });
    results.external.dev_api = dRes.ok ? 'ONLINE' : 'ERROR_' + dRes.status;
  } catch (e) {
    results.external.dev_api = 'UNREACHABLE';
  }
  
  return res.status(200).json(results);
}
