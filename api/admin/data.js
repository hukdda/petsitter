
import { db } from '../_db.js';

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    // 통계 계산
    const totalRevenue = db.bookings.reduce((acc, curr) => acc + (curr.totalCost || 0), 0);
    const totalBookings = db.bookings.length;
    const totalApps = db.applications.length;

    // 최신순 정렬 (ID나 날짜 기준)
    const sortedBookings = [...db.bookings].sort((a, b) => 
      new Date(b.createdAt || b.paidAt).getTime() - new Date(a.createdAt || a.paidAt).getTime()
    );
    
    const sortedApps = [...db.applications].sort((a, b) => 
      new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
    );

    return res.status(200).json({
      success: true,
      bookings: sortedBookings,
      applications: sortedApps,
      comments: db.comments,
      stats: {
        totalRevenue,
        totalBookings,
        totalApps
      }
    });
  } catch (err) {
    console.error('[ADMIN DATA ERROR]', err);
    return res.status(500).json({ 
      success: false, 
      message: '데이터를 불러오는 중 서버 오류가 발생했습니다.',
      error: err.message 
    });
  }
}
