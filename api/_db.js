<<<<<<< HEAD

export const db = {
  comments: [
    {
      id: 'init_1',
      author: '김민지',
      region: '부산 해운대구',
      content: '처음 맡겨봤는데 시터님이 너무 친절하게 아이 사진도 많이 보내주시고 밥도 잘 챙겨주셔서 안심했어요! 다음 출장 때도 또 이용할게요.',
      rating: 5,
      createdAt: '2025-02-10',
      sitterName: '최은경 시터님',
      serviceType: '방문돌봄 60분',
      profileImg: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Minji',
      relativeTime: '2일 전',
      isApproved: true
    },
    {
      id: 'init_2',
      author: '박준형',
      region: '서울 강남구',
      content: '갑자기 급한 일이 생겨서 예약했는데 30분 만에 배칭되고 너무 완벽하게 산책까지 시켜주셨습니다. 최고예요!',
      rating: 5,
      createdAt: '2025-02-12',
      sitterName: '김도윤 시터님',
      serviceType: '방문돌봄 30분',
      profileImg: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jun',
      relativeTime: '5시간 전',
      isApproved: true
    }
  ],
  applications: [],
  bookings: []
};
=======
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
>>>>>>> eb423f517925f7b12f1d3f3e160c6f538480f8cc
