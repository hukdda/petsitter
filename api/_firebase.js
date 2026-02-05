/**
 * Firebase Admin SDK + Telegram 알림 통합 유틸리티
 */

// Firebase Admin SDK (ES6 import)
import admin from 'firebase-admin';

let firebaseInitialized = false;

/**
 * Firebase 초기화 (한 번만 실행)
 */
function initFirebase() {
  if (firebaseInitialized) return;

  try {
    // 이미 초기화된 앱이 있는지 확인
    if (admin.apps.length === 0) {
      // Vercel 환경 변수에서 서비스 계정 정보 가져오기
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : null;

      if (serviceAccount) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase initialized successfully');
      } else {
        console.error('❌ FIREBASE_SERVICE_ACCOUNT environment variable not found');
        throw new Error('Firebase credentials missing');
      }
    }
    
    firebaseInitialized = true;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
}

/**
 * Firestore 데이터베이스 가져오기
 */
export function getDB() {
  initFirebase();
  return admin.firestore();
}

/**
 * 컬렉션 이름 상수
 */
export const COLLECTIONS = {
  COMMENTS: 'comments',
  APPLICATIONS: 'applications',
  BOOKINGS: 'bookings',
};

/**
 * Telegram 메시지 전송
 */
export async function sendTelegram(message) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('⚠️ Telegram credentials not configured');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (response.ok) {
      console.log('✅ Telegram notification sent');
      return true;
    } else {
      console.error('❌ Telegram API error:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('❌ Telegram notification failed:', error);
    return false;
  }
}

/**
 * CORS 헤더 설정 (모든 API에서 사용)
 */
export function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/**
 * 상대 시간 계산 (예: "3시간 전", "2일 전")
 */
export function getRelativeTime(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return past.toLocaleDateString('ko-KR');
}
