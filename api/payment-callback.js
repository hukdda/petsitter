export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const data = req.method === 'POST' ? req.body : req.query;
  
  console.log('[PAYMENT_CALLBACK]', data);

  const resultCd = data.res_cd || data.result || data.RESULT || '';
  const isSuccess = resultCd === '0000' || resultCd === 'success' || resultCd === 'SUCCESS';
  const orderNo = data.orderno || data.ORDERNO || data.merchant_uid || '';
  const resMsg = data.res_msg || data.message || '결제가 처리되었습니다.';

  if (isSuccess) {
    const query = new URLSearchParams({
      result: 'success',
      orderno: orderNo,
      authno: data.authno || 'MANUAL_AUTH'
    }).toString();
    
    res.writeHead(302, { Location: `/payment/callback?${query}` });
    res.end();
  } else {
    const query = new URLSearchParams({
      result: 'fail',
      res_msg: resMsg,
      orderno: orderNo
    }).toString();
    
    res.writeHead(302, { Location: `/payment/callback?${query}` });
    res.end();
  }
}
