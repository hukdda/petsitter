import { db } from './_db.js';

async function sendTelegram(msg) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7224856037:AAFI0xI30XyJ-pY1M-P5lRzH6fR9fXvYvYk";
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "1028713025";
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'HTML' })
    });
    return response.ok;
  } catch (e) { 
    return false; 
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const path = req.url.split('?')[0];

  if (path.includes('calculate-price')) {
    try {
      const { basePrice, startDate, endDate, petCount, visitTime } = req.body;
      
      const start = new Date(`${startDate}T00:00:00Z`);
      const end = new Date(`${endDate}T00:00:00Z`);
      
      const now = new Date();
      const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
      const todayStr = kstNow.toISOString().split('T')[0];
      
      const surcharges = new Set();
      let totalCost = 0;
      let totalDays = 0;

      const BIG_HOLIDAYS = [
        '2025-01-25', '2025-01-26', '2025-01-27', '2025-01-28', '2025-01-29', '2025-01-30',
        '2025-10-03', '2025-10-04', '2025-10-05', '2025-10-06', '2025-10-07', '2025-10-08', '2025-10-09'
      ];
      
      const PUBLIC_HOLIDAYS = [
        '2025-03-01', '2025-05-05', '2025-06-06', '2025-08-15', '2025-10-03', '2025-10-09', '2025-12-25'
      ];
      
      const isPeak = (date) => {
        const m = date.getUTCMonth() + 1;
        const d = date.getUTCDate();
        return (m === 5 && d <= 5) || (m === 7 && d >= 20) || (m === 8 && d <= 15);
      };

      const hour = visitTime ? parseInt(visitTime.split(':')[0]) : 12;
      const isNight = hour >= 20 || hour < 8;

      let d = new Date(start);
      while (d <= end) {
        totalDays++;
        let dailyCost = basePrice;
        const dateStr = d.toISOString().split('T')[0];
        const dayOfWeek = d.getUTCDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        if (BIG_HOLIDAYS.includes(dateStr)) {
          dailyCost += 10000;
          surcharges.add('명절 할증 (+1.0만)');
        } else if (isPeak(d)) {
          dailyCost += 5000;
          surcharges.add('성수기 할증 (+0.5만)');
        } else if (isWeekend || PUBLIC_HOLIDAYS.includes(dateStr)) {
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
      return res.status(500).json({ success: false, message: '금액 계산 중 오류' });
    }
  }

  return res.status(404).json({ message: 'Endpoint not found' });
}
