
export default async function handler(req, res) {
  const { domain = 'lovelypetsitter.com' } = req.query;
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  // 시도할 대상 URL 리스트 (우선순위: magnesy -> nexpay)
  const targets = [
    'https://dev01.ver.ne.magnesy.com/sdk/js/mepay.js',
    'http://develop.nex.magnexpay.com/sdk/js/mepay.js',
    'https://api.nexpay.co.kr/sdk/js/nexpay.js',
    'https://develop.nex-pay.co.kr/sdk/js/nexpay.js'
  ];

  for (const url of targets) {
    try {
      console.log(`[PROXY_ATTEMPT] Target: ${url} for Domain: ${domain}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5초 타임아웃

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Referer': `https://${domain}/`,
          'Origin': `https://${domain}`
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[PROXY_SKIP] ${url} returned status ${response.status}`);
        continue;
      }

      const jsCode = await response.text();
      
      // HTML(에러페이지) 필터링 및 최소 길이 검증
      if (jsCode.includes('<!DOCTYPE') || jsCode.length < 1000) {
        console.warn(`[PROXY_SKIP] ${url} returned invalid content`);
        continue;
      }

      console.log(`[PROXY_SUCCESS] Loaded from ${url}`);
      res.setHeader('X-SDK-Source', url);
      return res.status(200).send(jsCode);
    } catch (error) {
      console.error(`[PROXY_ERROR] ${url}: ${error.message}`);
      continue;
    }
  }

  // 최악의 경우: 가상 브릿지 코드 (수기 결제 유도)
  return res.status(200).send(`
    console.warn("All SDK targets failed. Initializing fail-safe bridge.");
    window.NexPay = window.NexPay || { 
      pay: function(p) { 
        if(confirm("일반 결제 엔진 연결이 지연되고 있습니다. 더 빠르고 확실한 [카드 수기 결제]를 이용하시겠습니까?")) {
           window.dispatchEvent(new CustomEvent('SWITCH_TO_SUGI'));
        }
      } 
    };
    window.MePay = window.NexPay;
  `);
}
