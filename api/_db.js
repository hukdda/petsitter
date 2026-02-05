import admin from 'firebase-admin';

// 1. 구글 보안 연결 설정 (Vercel 환경 변수 활용)
const serviceAccount = {
  projectId: process.env.GOOGLE_PROJECT_ID,
  clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
  // privateKey 줄바꿈 처리는 Vercel 배포의 필수 관문입니다!
  privateKey: process.env.GOOGLE_PRIVATE_KEY 
    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') 
    : undefined,
};

// 2. 구글 서비스 초기화
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ 구글 데이터베이스(Firestore) 연결 성공!");
  } catch (error) {
    console.error("❌ 구글 연결 실패:", error);
  }
}

// 3. 실제 DB 도구 내보내기 (이제 'db'라는 이름으로 진짜 DB를 사용합니다)
// 기존 코드들이 'db'라는 이름을 쓰고 있을 것이므로, 이름을 'db'로 맞춰서 내보냅니다.
const db = admin.firestore();

export { db, admin };