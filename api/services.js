
import { db } from './_db.js';

async function sendTelegram(msg) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7224856037:AAFI0xI30XyJ-pY1M-P5lRzH6fR9fXvYvYk";
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "1028713025";
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'HTML' })
    });
  } catch (e) {}
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const path = req.url.split('?')[0];

  // 1. 상세 금액 계산 로직 (이전 버전의 모든 날짜 복구)
  if (path.includes('calculate-price')) {
    const { basePrice, startDate, endDate, petCount, visitTime } = req.body;
    const now = new Date();
    const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const todayStr = kstNow.toISOString().split('T')[0];
    const start = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T00:00:00Z`);
    const surcharges = new Set();
    let totalCost = 0; let totalDays = 0;

    const BIG_HOLIDAY_SEASON = [
      '2025-01-25', '2025-01-26', '2025-01-27', '2025-01-28', '2025-01-29', '2025-01-30',
      '2025-10-03', '2025-10-04', '2025-10-05', '2025-10-06', '2025-10-07', '2025-10-08', '2025-10-09',
      '2026-02-14', '2026-02-15', '2026-02-16', '2026-02-17', '2026-02-18',
      '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27'
    ];
    const PUBLIC_HOLIDAYS = ['2025-01-01', '2025-03-01', '2025-05-05', '2025-06-06', '2025-08-15', '2025-10-03', '2025-10-09', '2025-12-25'];
    const isPeak = (date) => {
      const m = date.getUTCMonth() + 1; const d = date.getUTCDate();
      return (m === 5 && d <= 5) || (m === 7 && d >= 20) || (m === 8 && d <= 15);
    };

    const hour = parseInt(visitTime.split(':')[0]);
    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
      totalDays++; let daily = basePrice;
      const dStr = d.toISOString().split('T')[0];
      if (BIG_HOLIDAY_SEASON.includes(dStr)) { daily += 10000; surcharges.add('명절 집중 할증 (+1.0만)'); }
      else if (isPeak(d)) { daily += 5000; surcharges.add('성수기 할증 (+0.5만)'); }
      else if (d.getUTCDay() === 0 || d.getUTCDay() === 6 || PUBLIC_HOLIDAYS.includes(dStr)) { daily += 5000; surcharges.add('주말/공휴일 할증 (+0.5만)'); }
      if (hour >= 20 || hour < 8) { daily += 5000; surcharges.add('야간 할증 (+0.5만)'); }
      totalCost += daily;
    }
    if (startDate === todayStr) { totalCost += 10000; surcharges.add('당일 긴급 예약 (+1.0만)'); }
    if (petCount > 1) { totalCost += 5000 * (petCount - 1) * totalDays; surcharges.add(`다견/다묘 할증 (${petCount}마리)`); }
    return res.status(200).json({ totalCost, totalDays, surcharges: Array.from(surcharges), orderId: `PET_${Date.now().toString(36).toUpperCase()}` });
  }

  // 2. 후기 로직
  if (path.includes('comments')) {
    if (req.method === 'GET') return res.status(200).json(db.comments);
    const { author, region, content } = req.body;
    const newComment = { id: `com_${Date.now()}`, author, region, content, createdAt: new Date().toISOString().split('T')[0], profileImg: `https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`, sitterName: '전문 시터님', serviceType: '방문돌봄', isApproved: true, relativeTime: '방금 전' };
    db.comments.unshift(newComment);
    await sendTelegram(`💬 <b>새 후기:</b> ${author}\n${content.substring(0, 50)}...`);
    return res.status(200).json({ success: true, data: newComment });
  }

  // 3. 지원서 로직
  if (path.includes('applications')) {
    const app = { ...req.body, id: `app_${Date.now()}`, appliedAt: new Date().toISOString() };
    db.applications.push(app);
    await sendTelegram(`🎖️ <b>신규 지원:</b> ${app.name}\n📍 ${app.address}\n📞 ${app.phone}`);
    return res.status(200).json({ success: true, data: app });
  }
}
