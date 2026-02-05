/**
 * 결제 검증 및 예약 저장 API (Firebase Firestore 버전)
 * POST: 결제 검증 및 예약 데이터 저장
 */

import { getFirestore, sendTelegram } from './_firebase.js';

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const db = getFirestore();
    const bookingsRef = db.collection('bookings');

    const { merchant_uid, amount, paymentMethod, bookingData } = req.body;

    if (!merchant_uid || !amount) {
      return res.status(400).json({
        success: false,
        message: '필수 정보가 누락되었습니다.',
      });
    }

    // 예약 데이터 구성
    const booking = {
      orderId: merchant_uid,
      amount,
      paymentMethod, // 'CARD' or 'BANK'
      status: paymentMethod === 'BANK' ? 'WAITING_DEPOSIT' : 'PAID',
      ...bookingData,
      createdAt: new Date().toISOString(),
      paidAt: paymentMethod === 'CARD' ? new Date().toISOString() : null,
    };

    // Firestore에 저장
    const docRef = await bookingsRef.add(booking);

    // Telegram 알림
    const statusText = paymentMethod === 'BANK' ? '입금 대기' : '결제 완료';
    await sendTelegram(`🎉 <b>새로운 예약 발생</b> (${statusText})
📝 주문번호: ${merchant_uid}
👤 예약자: ${bookingData.userName || '미입력'}
📞 연락처: ${bookingData.userPhone || '미입력'}
📍 주소: ${bookingData.address || '미입력'}
🐕 아이 이름: ${bookingData.petName || '미입력'}
📅 시작일: ${bookingData.startDate || '미입력'}
💰 금액: ${amount.toLocaleString()}원
💳 결제: ${paymentMethod === 'BANK' ? '무통장 입금' : '카드 결제'}
${paymentMethod === 'BANK' ? `💵 입금자: ${bookingData.depositorName || '미입력'}` : ''}`);

    return res.status(200).json({
      success: true,
      data: {
        id: docRef.id,
        ...booking,
      },
    });
  } catch (error) {
    console.error('결제 검증 API 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
}
