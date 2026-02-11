export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { basePrice, startDate, endDate, petCount, visitTime = '12:00' } = req.body;
    
    // ✅ 입력 검증
    if (!basePrice || !startDate || !endDate || !petCount) {
      return res.status(400).json({ 
        success: false, 
        message: '필수 정보가 누락되었습니다' 
      });
    }
    
    if (typeof basePrice !== 'number' || basePrice <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: '올바른 금액이 아닙니다' 
      });
    }
    
    if (typeof petCount !== 'number' || petCount < 1 || petCount > 10) {
      return res.status(400).json({ 
        success: false, 
        message: '반려동물 수는 1~10마리여야 합니다' 
      });
    }
    
    // ✅ 날짜 형식 검증
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({ 
        success: false, 
        message: '올바른 날짜 형식이 아닙니다 (YYYY-MM-DD)' 
      });
    }
    
    // ✅ 타임존 버그 수정 (KST 기준)
    const start = new Date(startDate + 'T00:00:00+09:00');
    const end = new Date(endDate + 'T00:00:00+09:00');
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ 
        success: false, 
        message: '유효하지 않은 날짜입니다' 
      });
    }
    
    if (end < start) {
      return res.status(400).json({ 
        success: false, 
        message: '종료일은 시작일보다 늦어야 합니다' 
      });
    }
    
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (diffDays > 30) {
      return res.status(400).json({ 
        success: false, 
        message: '최대 30일까지 예약 가능합니다' 
      });
    }
    
    // ✅ 방문 시간 검증
    if (visitTime) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(visitTime)) {
        return res.status(400).json({ 
          success: false, 
          message: '올바른 시간 형식이 아닙니다 (HH:MM)' 
        });
      }
      
      const [hour] = visitTime.split(':').map(Number);
      if (hour < 7 || hour >= 22) {
        return res.status(400).json({ 
          success: false, 
          message: '방문 시간은 07:00~22:00 사이여야 합니다' 
        });
      }
    }
    
    const now = new Date();
    const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const todayStr = kstNow.toISOString().split('T')[0];
    
    const surcharges = new Set();
    let totalCost = 0;
    let totalDays = 0;

    // ✅ S등급 할증 날짜 (명절 연휴)
    const BIG_HOLIDAY_SEASON = [
      // 2025년 설날 연휴
      '2025-01-25', '2025-01-26', '2025-01-27', '2025-01-28', '2025-01-29', '2025-01-30',
      // 2025년 추석 연휴
      '2025-10-03', '2025-10-04', '2025-10-05', '2025-10-06', '2025-10-07', '2025-10-08', '2025-10-09',
      // 2025년 크리스마스 연휴
      '2025-12-24', '2025-12-25', '2025-12-26', '2025-12-27', '2025-12-28',
      
      // 2026년 설날 연휴 (주말 포함)
      '2026-02-14', '2026-02-15', '2026-02-16', '2026-02-17', '2026-02-18',
      // 2026년 추석 연휴 (개천절+주말 포함)
      '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07',
      // 2026년 크리스마스 연휴
      '2026-12-24', '2026-12-25', '2026-12-26', '2026-12-27', '2026-12-28'
    ];

    // ✅ 공휴일
    const PUBLIC_HOLIDAYS = [
      '2025-01-01', '2025-03-01', '2025-05-05', '2025-06-06', '2025-08-15', '2025-10-03', '2025-10-09', '2025-12-25',
      '2026-01-01', '2026-03-01', '2026-05-05', '2026-06-06', '2026-08-15', '2026-10-03', '2026-10-09', '2026-12-25'
    ];

    // ✅ 여름 성수기 (고객 설정대로)
    const isPeakSeason = (date) => {
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth() + 1;
      const day = date.getUTCDate();
      
      // 7/25 ~ 8/9
      if (month === 7 && day >= 25) return true;
      if (month === 8 && day <= 9) return true;
      
      return false;
    };

    const hour = parseInt(visitTime.split(':')[0]);
    const isNight = hour >= 20 || hour < 8;

    let d = new Date(start);
    while (d <= end) {
      totalDays++;
      let dailyCost = basePrice;
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getUTCDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // 할증 우선순위: 명절 > 성수기 > 주말/공휴일
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
      d.setUTCDate(d.getUTCDate() + 1);
    }

    // 당일 긴급 할증 (예약 시작일이 오늘인 경우)
    if (startDate === todayStr) {
      totalCost += 10000;
      surcharges.add('당일 긴급 할증 (+1.0만)');
    }

    // 다견/다묘 할증
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
    return res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다' 
    });
  }
}