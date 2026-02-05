import admin from 'firebase-admin';

// 환경변수에서 키를 가져오되, 따옴표가 섞여있으면 제거합니다.
const privateKey = process.env.GOOGLE_PRIVATE_KEY 
  ? process.env.GOOGLE_PRIVATE_KEY.replace(/"/g, '').replace(/\\n/g, '\n') 
  : undefined;

const serviceAccount = {
  projectId: process.env.GOOGLE_PROJECT_ID,
  clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
  privateKey: privateKey,
};

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin Initialized");
  } catch (error) {
    // 여기서 어떤 에러가 나는지 아주 상세히 찍히게 했습니다.
    console.error("❌ Firebase 초기화 상세 에러:", error);
  }
}

const db = admin.firestore();
export { db, admin };