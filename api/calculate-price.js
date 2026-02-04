
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { basePrice, startDate, endDate, petCount, visitTime = '12:00' } = req.body;
    
    // 한국 시간 기준으로 '오늘' 구하기 (Vercel 서버 시간 보정)
    const now = new Date();
    const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const todayStr = kstNow.toISOString().split('T')[0];

    // 입력받은 날짜를 UTC 자정 기준으로 고정 (날짜 계산용)
    const start = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T00:00:00Z`);
    
    const surcharges = new Set();
    let totalCost = 0;
    let totalDays = 0;

    // 명절 및 연결된 주말 (무조건 1만원 할증 구간)
    const BIG_HOLIDAY_SEASON = [
      '2025-01-25', '2025-01-26', '2025-01-27', '2025-01-28', '2025-01-29', '2025-01-30',
      '2025-10-03', '2025-10-04', '2025-10-05', '2025-10-06', '2025-10-07', '2025-10-08', '2025-10-09',
      '2026-02-14', '2026-02-15', '2026-02-16', '2026-02-17', '2026-02-18',
      '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27'
    ];

    const PUBLIC_HOLIDAYS = [
      '2025-01-01', '2025-03-01', '2025-05-05', '2025-06-06', '2025-08-15', '2025-10-03', '2025-10-09', '2025-12-25',
      '2026-01-01', '2026-03-01', '2026-05-05', '2026-06-06', '2026-08-15', '2026-10-03', '2026-10-09', '2026-12-25'
    ];

    const isPeakSeason = (date) => {
      const month = date.getUTCMonth() + 1;
      const day = date.getUTCDate();
      if (month === 5 && day >= 1 && day <= 5) return true;
      if ((month === 7 && day >= 20) || (month === 8 && day <= 15)) return true;
      return false;
    };

    const hour = parseInt(visitTime.split(':')[0]);
    const isNight = hour >= 20 || hour < 8;

    // 날짜 루프 로직 수정: while 문으로 변경하여 무한 루프나 누락 방지
    let d = new Date(start);
    while (d <= end) {
      totalDays++;
      let dailyCost = basePrice;
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getUTCDay(); // 0: 일요일, 6: 토요일
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (BIG_HOLIDAY_SEASON.includes(dateStr)) {
        dailyCost += 10000;
        surcharges.add('명절 할증 (+1.0만)');
      } 
      else if (isPeakSeason(d)) {
        dailyCost += 5000;
        surcharges.add('성수기 할증 (+0.5만)');
      } 
      else if (isWeekend || PUBLIC_HOLIDAYS.includes(dateStr)) {
        dailyCost += 5000;
        surcharges.add('주말/공휴일 할증 (+0.5만)');
      }

      if (isNight) {
        dailyCost += 5000;
        surcharges.add('야간 할증 (+0.5만)');
      }

      totalCost += dailyCost;
      
      // 다음 날로 이동 (UTC 기준 안전하게 가산)
      d.setUTCDate(d.getUTCDate() + 1);
    }

    if (startDate === todayStr) {
      totalCost += 10000;
      surcharges.add('당일 긴급 할증 (+1.0만)');
    }

    if (petCount > 1) {
      const extraPetCost = 5000 * (petCount - 1) * totalDays;
      totalCost += extraPetCost;
      surcharges.add(`다견/다묘 할증 (${petCount}마리)`);
    }

    return res.status(200).json({ 
      totalCost, 
      totalDays, 
      surcharges: Array.from(surcharges),
      orderId: `ORD_${Date.now().toString(36).toUpperCase()}` 
    });
  } catch (err) {
    console.error('[CALC_ERROR]', err);
    return res.status(500).json({ success: false, message: '금액 계산 중 오류 발생' });
  }
}
