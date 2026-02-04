
/**
 * 펫시터의 정석 - 로컬 비즈니스 로직 (Mock Server 역할을 수행)
 */

const db = {
  applications: [] as any[],
  bookings: [] as any[], 
  payments: [] as any[],
  comments: [
    {
      id: 'init_1',
      author: '김민지',
      region: '부산 해운대구',
      content: '처음 맡겨봤는데 시터님이 너무 친절하게 아이 사진도 많이 보내주시고 밥도 잘 챙겨주셔서 안심했어요!',
      rating: 5,
      createdAt: '2025-02-10',
      sitterName: '이지은 시터님',
      serviceType: '방문돌봄 60분',
      profileImg: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Minji',
      relativeTime: '2일 전',
      isApproved: true
    }
  ] as any[],
};

// 로컬 환경에서도 알림 테스트를 가능하게 하기 위한 함수 (Vercel에서는 api/ 폴더가 담당함)
const sendTelegramNotificationLocal = async (message: string) => {
  const BOT_TOKEN = (import.meta as any).env?.VITE_TELEGRAM_BOT_TOKEN || '';
  const CHAT_ID = (import.meta as any).env?.VITE_TELEGRAM_CHAT_ID || '';
  
  if (!BOT_TOKEN || !CHAT_ID) return;
  
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'HTML' })
    });
  } catch (e) {
    console.error('Local Notification Error:', e);
  }
};

export const calculatePriceLocal = (data: any) => {
  const { basePrice, startDate, endDate, petCount, phone = '' } = data;
  if (!startDate || !endDate) return { totalCost: 0, totalDays: 0, orderId: '', surcharges: [] };

  const start = new Date(startDate);
  const end = new Date(endDate);
  let totalCost = 0;
  let totalDays = 0;
  const surcharges = new Set<string>();

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    totalDays++;
    let dailyCost = basePrice;
    
    const day = d.getDay();
    if (day === 0 || day === 6) { 
      dailyCost += 5000; 
      surcharges.add('주말 할증'); 
    }
    totalCost += dailyCost;
  }

  if (petCount > 1) {
    totalCost += 5000 * (petCount - 1) * totalDays;
    surcharges.add('다견/다묘 할증');
  }

  const cleanPhone = phone.replace(/-/g, '') || '00000000000';
  const orderId = `PET_${cleanPhone}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  return { totalCost, totalDays, orderId, surcharges: Array.from(surcharges) };
};

export const verifyPaymentLocal = async (paymentData: any) => {
  const newBooking = {
    ...paymentData.bookingData,
    id: paymentData.merchant_uid,
    status: 'PAID',
    paidAt: new Date().toISOString()
  };
  
  db.bookings.push(newBooking);
  db.payments.push({
    merchant_uid: paymentData.merchant_uid,
    imp_uid: paymentData.imp_uid,
    amount: paymentData.amount,
    status: 'SUCCESS'
  });
  
  await sendTelegramNotificationLocal(`💳 [로컬테스트] 새로운 예약 성공: ${newBooking.userName}`);
  
  return { success: true };
};

export const getCommentsLocal = () => db.comments.filter((c: any) => c.isApproved);

export const addCommentLocal = async (data: any) => {
  const newComment = {
    id: `com_${Date.now()}`,
    author: data.author,
    region: data.region,
    content: data.content,
    rating: 5,
    createdAt: new Date().toISOString().split('T')[0],
    sitterName: '전문 돌봄님',
    serviceType: '방문돌봄',
    profileImg: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.author}`,
    relativeTime: '방금 전',
    isApproved: true
  };
  db.comments.unshift(newComment);
  
  await sendTelegramNotificationLocal(`💬 [로컬테스트] 새로운 후기: ${newComment.author}`);
  
  return { success: true, data: newComment };
};

export const getAdminDataLocal = () => ({
  applications: db.applications,
  payments: db.payments,
  bookings: db.bookings,
  comments: db.comments,
  stats: {
    totalRevenue: db.bookings.reduce((acc, curr) => acc + (curr.totalCost || 0), 0),
    totalApps: db.applications.length,
    totalBookings: db.bookings.length
  }
});

export const handleSocialLoginLocal = async (provider: string, code: string) => {
  return { 
    success: true, 
    user: { 
      name: '테스트 유저', 
      email: 'test@example.com',
      profileImg: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Test' 
    } 
  };
};

export const saveApplicationLocal = async (data: any) => {
  const newApp = { ...data, id: `app_${Date.now()}`, appliedAt: new Date().toISOString() };
  db.applications.push(newApp);
  
  await sendTelegramNotificationLocal(`🎖️ [로컬테스트] 새로운 지원서: ${newApp.name}`);
  
  return { success: true, data: newApp };
};
