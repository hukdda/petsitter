
import { db } from './_db.js';

async function sendTelegramNotification(message) {
  const allKeys = Object.keys(process.env);
  const findEnv = (target) => {
    const key = allKeys.find(k => 
      k.trim().toUpperCase() === target.toUpperCase() || 
      k.trim().toUpperCase().includes(target.toUpperCase())
    );
    return key ? process.env[key].trim() : null;
  };

  const BOT_TOKEN = findEnv('TELEGRAM_BOT_TOKEN') || findEnv('BOT_TOKEN');
  const CHAT_ID = findEnv('TELEGRAM_CHAT_ID') || findEnv('CHAT_ID');
  
  if (!BOT_TOKEN || !CHAT_ID) return false;

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'HTML' })
    });
    return response.ok;
  } catch (err) {
    console.error('[TELEGRAM_ERROR]', err);
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      return res.status(200).json(db.comments);
    }

    if (req.method === 'POST') {
      const { author, region, content } = req.body;
      const newComment = { 
        id: `com_${Date.now()}`, 
        author,
        region,
        content,
        createdAt: new Date().toISOString().split('T')[0],
        profileImg: `https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`,
        relativeTime: '방금 전',
        sitterName: '전문 시터님',
        serviceType: '방문돌봄',
        isApproved: true
      };
      
      db.comments.unshift(newComment);

      const msg = `
💬 <b>홈페이지 새로운 후기 등록</b>

👤 작성자: ${author} 님
📍 지역: ${region}
📝 내용: ${content.substring(0, 100)}...
      `.trim();
      
      await sendTelegramNotification(msg);

      return res.status(200).json({ success: true, data: newComment });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
