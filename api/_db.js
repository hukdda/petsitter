import admin from 'firebase-admin';

// 1. 구글 보안 연결 설정 (Vercel 환경 변수 활용)
const serviceAccount = {
  projectId: process.env.GOOGLE_PROJECT_ID,
  clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
  // private_key 줄바꿈 처리 필수
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

// 3. 실제 DB 도구 내보내기
export const firestore = admin.firestore();

// 4. 가짜 데이터 삭제 및 빈 그릇 준비
// 다른 코드들이 'db'를 참조하고 있을 것이므로, 구조는 유지하되 데이터만 비웁니다.
export const db = {
  applications: [],
  bookings: [],
  payments: [],
  comments: [] // 👈 가짜 '김민지', '박준형' 데이터를 여기서 싹 지웠습니다!
};