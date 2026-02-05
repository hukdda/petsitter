<<<<<<< HEAD

import { db } from './_db.js';
=======
import { db, firestore } from './_db.js'; // 👈 firestore 도구를 추가로 가져옵니다.
>>>>>>> eb423f517925f7b12f1d3f3e160c6f538480f8cc

async function sendTelegram(msg) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "7224856037:AAFI0xI30XyJ-pY1M-P5lRzH6fR9fXvYvYk";
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID || "1028713025";
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
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

  const path = req.url.split('?')[0];

<<<<<<< HEAD
  if (path.includes('calculate-price')) {
    try {
      const { basePrice, startDate, endDate, petCount, visitTime } = req.body;
      
      const start = new Date(`${startDate}T00:00:00Z`);
      const end = new Date(`${endDate}T00:00:00Z`);
      
      const now = new Date();
      const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
      const todayStr = kstNow.toISOString().split('T')[0];
      
=======
  // 1. 가격 계산 (이 부분은 계산 로직이라 그대로 유지합니다)
  if (path.includes('calculate-price')) {
    try {
      const { basePrice, startDate, endDate, petCount, visitTime } = req.body;
      const start = new Date(`${startDate}T00:00:00Z`);
      const end = new Date(`${endDate}T00:00:00Z`);
      const now = new Date();
      const kstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
      const todayStr = kstNow.toISOString().split('T')[0];
>>>>>>> eb423f517925f7b12f1d3f3e160c6f538480f8cc
      const surcharges = new Set();
      let totalCost = 0;

      const BIG_HOLIDAYS = ['2025-01-25', '2025-01-26', '2025-01-27', '2025-01-28', '2025-01-29', '2025-01-30', '2025-10-03', '2025-10-04', '2025-10-05', '2025-10-06', '2025-10-07', '2025-10-08', '2025-10-09'];
      const PUBLIC_HOLIDAYS = ['2025-03-01', '2025-05-05', '2025-06-06', '2025-08-15', '2025-10-03', '2025-10-09', '2025-12-25'];
      
      const isPeak = (date) => {
        const m = date.getUTCMonth() + 1;
        const d = date.getUTCDate();
        return (m === 5 && d <= 5) || (m === 7 && d >= 20) || (m === 8 && d <= 15);
      };

      const hour = visitTime ? parseInt(visitTime.split(':')[0]) : 12;
<<<<<<< HEAD
      
      // 정확한 일수 계산 (밀리초 차이 -> 일 단위 반올림)
=======
>>>>>>> eb423f517925f7b12f1d3f3e160c6f538480f8cc
      const diffTime = end.getTime() - start.getTime();
      const totalDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

      for (let i = 0; i < totalDays; i++) {
        let daily = basePrice;
        const current = new Date(start.getTime() + (i * 24 * 60 * 60 * 1000));
        const dStr = current.toISOString().split('T')[0];
        const day = current.getUTCDay();
<<<<<<< HEAD
        
        if (BIG_HOLIDAYS.includes(dStr)) {
          daily += 10000;
          surcharges.add('명절 할증 (+1.0만)');
        } else if (isPeak(current)) {
          daily += 5000;
          surcharges.add('성수기 할증 (+0.5만)');
        } else if (day === 0 || day === 6 || PUBLIC_HOLIDAYS.includes(dStr)) {
          daily += 5000;
          surcharges.add('주말/공휴일 할증 (+0.5만)');
        }

        if (hour >= 20 || hour < 8) {
          daily += 5000;
          surcharges.add('야간 할증 (+0.5만)');
        }
        
        totalCost += daily;
      }

      if (startDate === todayStr) {
        totalCost += 10000;
        surcharges.add('당일 긴급 할증 (+1.0만)');
      }

      if (petCount > 1) {
        totalCost += 5000 * (petCount - 1) * totalDays;
        surcharges.add(`다견/다묘 할증 (${petCount}마리)`);
      }

      return res.status(200).json({ 
        totalCost, 
        totalDays, 
        surcharges: Array.from(surcharges), 
        orderId: `PET_${Date.now().toString(36).toUpperCase()}` 
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (path.includes('comments')) {
    if (req.method === 'GET') return res.status(200).json(db.comments);
    const { author, region, content } = req.body;
    const newComment = { id: `com_${Date.now()}`, author, region, content, createdAt: new Date().toISOString().split('T')[0], profileImg: `https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`, sitterName: '전문 시터님', serviceType: '방문돌봄', isApproved: true, relativeTime: '방금 전' };
    db.comments.unshift(newComment);
    await sendTelegram(`💬 <b>새로운 후기 등록</b>\n👤 작성자: ${author}\n📍 지역: ${region}\n📝 내용: ${content.substring(0, 50)}...`);
    return res.status(200).json({ success: true, data: newComment });
  }

  if (path.includes('applications')) {
    const app = { ...req.body, id: `app_${Date.now()}`, appliedAt: new Date().toISOString() };
    db.applications.push(app);
    await sendTelegram(`🎖️ <b>신규 펫시터 지원서</b>\n👤 성함: ${app.name}\n📍 거주지: ${app.address}\n📞 연락처: ${app.phone}`);
    return res.status(200).json({ success: true, data: app });
  }
}
=======
        if (BIG_HOLIDAYS.includes(dStr)) { daily += 10000; surcharges.add('명절 할증 (+1.0만)'); }
        else if (isPeak(current)) { daily += 5000; surcharges.add('성수기 할증 (+0.5만)'); }
        else if (day === 0 || day === 6 || PUBLIC_HOLIDAYS.includes(dStr)) { daily += 5000; surcharges.add('주말/공휴일 할증 (+0.5만)'); }
        if (hour >= 20 || hour < 8) { daily += 5000; surcharges.add('야간 할증 (+0.5만)'); }
        totalCost += daily;
      }
      if (startDate === todayStr) { totalCost += 10000; surcharges.add('당일 긴급 할증 (+1.0만)'); }
      if (petCount > 1) { totalCost += 5000 * (petCount - 1) * totalDays; surcharges.add(`다견/다묘 할증 (${petCount}마리)`); }

      return res.status(200).json({ 
        totalCost, totalDays, surcharges: Array.from(surcharges), 
        orderId: `PET_${Date.now().toString(36).toUpperCase()}` 
      });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // 2. 후기(Comments) 조회 및 등록 - 구글 DB 연동
  if (path.includes('comments')) {
    try {
      if (req.method === 'GET') {
        // ✅ 구글 금고에서 최신순으로 데이터 가져오기
        const snapshot = await firestore.collection('comments').orderBy('createdAt', 'desc').get();
        const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return res.status(200).json(comments);
      }
      
      if (req.method === 'POST') {
        const { author, region, content } = req.body;
        const newComment = { 
          author, region, content, 
          createdAt: new Date().toISOString().split('T')[0], 
          profileImg: `https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`, 
          sitterName: '전문 시터님', serviceType: '방문돌봄', 
          isApproved: true, relativeTime: '방금 전' 
        };
        // ✅ 구글 금고에 영구 저장
        await firestore.collection('comments').add(newComment);
        await sendTelegram(`💬 <b>새로운 후기 등록</b>\n👤 작성자: ${author}\n📍 지역: ${region}\n📝 내용: ${content.substring(0, 50)}...`);
        return res.status(200).json({ success: true, data: newComment });
      }
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }

  // 3. 지원서(Applications) 접수 - 구글 DB 연동
  if (path.includes('applications')) {
    try {
      const app = { ...req.body, appliedAt: new Date().toISOString() };
      // ✅ 구글 금고에 영구 저장
      await firestore.collection('applications').add(app);
      await sendTelegram(`🎖️ <b>신규 펫시터 지원서</b>\n👤 성함: ${app.name}\n📍 거주지: ${app.address}\n📞 연락처: ${app.phone}`);
      return res.status(200).json({ success: true, data: app });
    } catch (e) { return res.status(500).json({ error: e.message }); }
  }
}
>>>>>>> eb423f517925f7b12f1d3f3e160c6f538480f8cc
