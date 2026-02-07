import admin from 'firebase-admin';

let firebaseInitialized = false;

function initFirebase() {
  if (firebaseInitialized) return;

  try {
    if (admin.apps.length === 0) {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : null;

      if (serviceAccount) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase initialized');
      } else {
        console.warn('⚠️ Firebase credentials not configured');
      }
    }
    firebaseInitialized = true;
  } catch (error) {
    console.error('❌ Firebase init failed:', error);
  }
}

export function getDB() {
  initFirebase();
  return admin.firestore();
}

export const COLLECTIONS = {
  COMMENTS: 'comments',
  APPLICATIONS: 'applications',
  BOOKINGS: 'bookings',
};

export async function sendTelegram(message) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('⚠️ Telegram not configured');
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
      console.log('✅ Telegram sent');
      return true;
    } else {
      console.error('❌ Telegram error:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('❌ Telegram failed:', error);
    return false;
  }
}

export function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

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
