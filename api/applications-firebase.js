/**
 * 시터 지원서 API (Firebase Firestore 버전)
 * POST: 새 지원서 등록
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
    const applicationsRef = db.collection('applications');

    const applicationData = {
      ...req.body,
      appliedAt: new Date().toISOString(),
      status: 'pending', // pending, approved, rejected
    };

    // Firestore에 저장
    const docRef = await applicationsRef.add(applicationData);

    // Telegram 알림
    const { name, phone, address, birthDate, gender } = req.body;
    await sendTelegram(`🎖️ <b>신규 펫시터 지원서</b>
👤 성함: ${name}
📞 연락처: ${phone}
📍 거주지: ${address}
🎂 생년월일: ${birthDate || '미입력'}
👥 성별: ${gender || '미입력'}

📋 자세한 내용은 관리자 페이지에서 확인하세요.`);

    return res.status(200).json({
      success: true,
      data: {
        id: docRef.id,
        ...applicationData,
      },
    });
  } catch (error) {
    console.error('지원서 API 오류:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
}
