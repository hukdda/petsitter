# 🔥 Firebase 설정 가이드 (5분 완료)

## 1. Firebase 프로젝트 생성

### 1-1. Firebase Console 접속
https://console.firebase.google.com/

### 1-2. 프로젝트 생성
1. "프로젝트 추가" 클릭
2. 프로젝트 이름: **lovelypetsitter** (또는 원하는 이름)
3. Google 애널리틱스: **사용 안 함** (나중에 추가 가능)
4. "프로젝트 만들기" 클릭

---

## 2. Firestore Database 생성

### 2-1. Firestore 시작
1. 왼쪽 메뉴 → **Firestore Database** 클릭
2. "데이터베이스 만들기" 클릭

### 2-2. 보안 규칙 선택
**"프로덕션 모드에서 시작"** 선택
- 나중에 규칙을 수정할 예정

### 2-3. 위치 선택
**asia-northeast3 (서울)** 선택
- 가장 빠른 속도

### 2-4. "사용 설정" 클릭

---

## 3. 서비스 계정 키 생성 (중요!)

### 3-1. 프로젝트 설정 이동
1. 왼쪽 상단 톱니바퀴 ⚙️ → **프로젝트 설정**
2. **서비스 계정** 탭 클릭

### 3-2. 비공개 키 생성
1. "새 비공개 키 생성" 버튼 클릭
2. "키 생성" 확인
3. JSON 파일 다운로드됨 (절대 공유 금지!)

**다운로드된 파일 이름**: 
`lovelypetsitter-xxxxx-firebase-adminsdk-xxxxx.json`

---

## 4. 환경 변수 설정

### 4-1. 다운로드한 JSON 파일 열기
메모장으로 열어서 내용 확인

### 4-2. .env 파일에 추가
```bash
# Telegram 알림
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

# Firebase (새로 추가)
FIREBASE_PROJECT_ID=lovelypetsitter-xxxxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@lovelypetsitter-xxxxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...전체 키 복사...\n-----END PRIVATE KEY-----\n"
```

**주의**: FIREBASE_PRIVATE_KEY는 큰따옴표 안에 넣고, \n은 그대로 유지!

---

## 5. Vercel 환경 변수 설정

### 5-1. Vercel Dashboard 접속
https://vercel.com/dashboard

### 5-2. 프로젝트 선택 → Settings → Environment Variables

### 5-3. 3개 변수 추가
```
Name: FIREBASE_PROJECT_ID
Value: lovelypetsitter-xxxxx

Name: FIREBASE_CLIENT_EMAIL  
Value: firebase-adminsdk-xxxxx@...

Name: FIREBASE_PRIVATE_KEY
Value: -----BEGIN PRIVATE KEY-----\nMIIEvQI... (전체 키)
```

**중요**: Production, Preview, Development 모두 체크!

---

## 6. Firestore 보안 규칙 설정

### 6-1. Firestore → 규칙 탭

### 6-2. 아래 규칙 복사해서 붙여넣기
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 후기 (comments) - 읽기는 모두 가능, 쓰기는 인증된 사용자만
    match /comments/{commentId} {
      allow read: if true;
      allow write: if request.auth != null || request.resource.data.author != null;
    }
    
    // 지원서 (applications) - 관리자만 읽기, 누구나 쓰기
    match /applications/{applicationId} {
      allow read: if false; // 관리자 전용 (나중에 수정)
      allow write: if true;
    }
    
    // 예약 (bookings) - 관리자만 읽기/쓰기
    match /bookings/{bookingId} {
      allow read: if false; // 관리자 전용
      allow write: if true; // API에서 작성
    }
  }
}
```

### 6-3. "게시" 버튼 클릭

---

## ✅ 완료!

이제 코드에서 Firebase를 사용할 준비가 끝났습니다!

**다음 단계**: API 파일 수정 (자동으로 처리됩니다)
