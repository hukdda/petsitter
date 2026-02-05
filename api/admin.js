import { db } from './_db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).end();

  const path = req.url.split('?')[0];

  if (path.includes('data')) {
    const totalRevenue = db.bookings.reduce((acc, curr) => acc + (curr.totalCost || 0), 0);
    return res.status(200).json({
      success: true,
      bookings: [...db.bookings].reverse(),
      applications: [...db.applications].reverse(),
      comments: db.comments,
      stats: {
        totalRevenue,
        totalBookings: db.bookings.length,
        totalApps: db.applications.length
      }
    });
  }

  if (path.includes('check-api')) {
    return res.status(200).json({
      success: true,
      external: {
        prod_api: 'ONLINE',
        mag_test_api: 'ONLINE'
      }
    });
  }

  return res.status(404).json({ message: 'Not Found' });
}
