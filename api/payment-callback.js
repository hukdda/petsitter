
export default async function handler(req, res) {
  // CORS 처리
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // 넥스페이/다우페이는 보통 POST body로 결과를 보냅니다.
  // Vercel에서 body-parser가 기본 작동하지만, 형식이 다를 경우를 대비합니다.
  const data = req.method === 'POST' ? req.body : req.query;
  
  console.log('[DEBUG_PAY_CALLBACK_RAW]', {
    method: req.method,
    data: data
  });

  // 넥스페이 표준 응답 필드 감지
  // res_cd: '0000'(성공), orderno: 주문번호, authno: 승인번호
  const resultCd = data.res_cd || data.result || data.RESULT || '';
  const isSuccess = resultCd === '0000' || resultCd === 'success' || resultCd === 'SUCCESS';
  const orderNo = data.orderno || data.ORDERNO || data.merchant_uid || '';
  const resMsg = data.res_msg || data.message || '결제가 처리되었습니다.';

  // 성공/실패 여부에 따라 프론트엔드로 리다이렉트
  // 프론트엔드 route: /payment/callback
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
