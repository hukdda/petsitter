
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
  } catch (e) { return false; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  try {
    // 1. 시터 지원서 (도그메이트 스타일 필드 통합)
    if (path.includes('applications')) {
      const data = req.body;
      db.applications.push({ ...data, appliedAt: new Date().toISOString() });
      
      const telegramMsg = `
🎖️ <b>[신규 시터 지원] 도그메이트 스타일</b>

👤 <b>성함:</b> ${data.name} (${data.gender})
📞 <b>연락처:</b> ${data.phone}
🎂 <b>생년월일:</b> ${data.birth}
📍 <b>지역:</b> ${data.address}
🏠 <b>환경:</b> ${data.residenceType} (${data.smoking})
🐾 <b>반려동물:</b> ${data.hasPet}

📝 <b>지원동기:</b>
${data.motivation.substring(0, 300)}...
      `.trim();

      await sendTelegram(telegramMsg);
      return res.status(200).json({ success: true });
    }

    // (이하 기존 V19 API 로직 유지...)
    if (path.includes('comments')) {
      if (req.method === 'GET') return res.status(200).json(db.comments);
      const { author, region, content } = req.body;
      const newComment = { id: `com_${Date.now()}`, author, region, content, createdAt: new Date().toISOString().split('T')[0], profileImg: `https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`, relativeTime: '방금 전', sitterName: '최지원 시터님', serviceType: '방문 돌봄', isApproved: true };
      db.comments.unshift(newComment);
      await sendTelegram(`💬 <b>새 후기 등록</b>\n작성자: ${author}\n내용: ${content.substring(0, 50)}...`);
      return res.status(200).json({ success: true, data: newComment });
    }

    if (path.includes('calculate-price')) {
      const { basePrice, startDate, endDate, petCount } = req.body;
      const start = new Date(startDate); const end = new Date(endDate);
      let totalCost = 0; let days = 0; const surcharges = new Set();
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days++; let daily = basePrice;
        if (d.getDay() === 0 || d.getDay() === 6) { daily += 5000; surcharges.add('주말 할증'); }
        totalCost += daily;
      }
      if (petCount > 1) { totalCost += 5000 * (petCount - 1) * days; surcharges.add('다견 할증'); }
      return res.status(200).json({ totalCost, totalDays: days, surcharges: Array.from(surcharges), orderId: `PET_${Date.now().toString(36).toUpperCase()}` });
    }

    if (path.includes('verify-payment')) {
      const { merchant_uid, amount, bookingData } = req.body;
      const newBooking = { ...bookingData, id: merchant_uid, status: 'WAITING', createdAt: new Date().toISOString() };
      db.bookings.push(newBooking);
      await sendTelegram(`🏦 <b>새 예약 접수 (무통장)</b>\n예약자: ${bookingData.userName}\n입금자: ${bookingData.depositorName}\n금액: ${amount.toLocaleString()}원`);
      return res.status(200).json({ success: true });
    }

    if (path.includes('admin/data')) {
      const totalRevenue = db.bookings.reduce((acc, curr) => acc + (curr.totalCost || 0), 0);
      return res.status(200).json({ success: true, bookings: [...db.bookings].reverse(), applications: [...db.applications].reverse(), stats: { totalRevenue, totalBookings: db.bookings.length, totalApps: db.applications.length } });
    }

    return res.status(404).json({ message: 'API Not Found' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
