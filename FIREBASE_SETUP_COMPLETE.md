# 🔥 Firebase 설정 완벽 가이드

## 목차
1. Firebase 프로젝트 생성
2. Firestore Database 설정
3. 서비스 계정 키 생성
4. 환경 변수 설정
5. Vercel 배포 설정
6. 테스트 및 확인

---

## 1. Firebase 프로젝트 생성 (3분)

### 1-1. Firebase Console 접속
https://console.firebase.google.com/

### 1-2. 새 프로젝트 만들기
1. "프로젝트 추가" 버튼 클릭
2. **프로젝트 이름**: `lovelypetsitter` (또는 원하는 이름)
3. **Google 애널리틱스**: 사용 안 함 (선택)
4. "프로젝트 만들기" 클릭

✅ 프로젝트 생성 완료!

---

## 2. Firestore Database 설정 (2분)

### 2-1. Firestore 데이터베이스 만들기
1. 왼쪽 메뉴 → **Firestore Database** 클릭
2. "데이터베이스 만들기" 클릭

### 2-2. 보안 규칙 선택
**"프로덕션 모드에서 시작"** 선택
(나중에 규칙 수정 예정)

### 2-3. 위치 선택
**asia-northeast3 (서울, South Korea)** 선택
→ 가장 빠른 속도!

### 2-4. "사용 설정" 클릭

✅ Firestore 데이터베이스 생성 완료!

---

## 3. 서비스 계정 키 생성 (2분) ⚠️ 중요!

### 3-1. 프로젝트 설정 이동
1. 좌측 상단 **⚙️ 톱니바퀴 아이콘** 클릭
2. **프로젝트 설정** 선택

### 3-2. 서비스 계정 탭
1. 상단 **"서비스 계정"** 탭 클릭
2. 아래로 스크롤

### 3-3. 새 비공개 키 생성
1. **"새 비공개 키 생성"** 버튼 클릭
2. "키 생성" 확인 클릭
3. **JSON 파일 자동 다운로드**

**다운로드된 파일 예시**:
```
lovelypetsitter-a1b2c.json
```

⚠️ **절대 공개하지 마세요!** (GitHub에 업로드 금지)

✅ 서비스 계정 키 다운로드 완료!

---

## 4. 환경 변수 설정

### 4-1. JSON 파일 열기
다운로드한 `lovelypetsitter-xxxxx.json` 파일을 메모장으로 열기

**파일 내용 예시**:
```json
{
  "type": "service_account",
  "project_id": "lovelypetsitter-a1b2c",
  "private_key_id": "abcd1234...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIB...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@lovelypetsitter.iam.gserviceaccount.com",
  ...
}
```

### 4-2. .env 파일 생성
프로젝트 루트에 `.env` 파일 생성:

```bash
# Telegram 알림 (기존)
TELEGRAM_BOT_TOKEN=7224856037:AAF...
TELEGRAM_CHAT_ID=-1002...

# Firebase (새로 추가)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"lovelypetsitter-a1b2c","private_key_id":"abcd1234...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIB...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@lovelypetsitter.iam.gserviceaccount.com",...전체 내용...}
```

⚠️ **주의사항**:
- **FIREBASE_SERVICE_ACCOUNT**: JSON 파일의 **전체 내용**을 한 줄로!
- 큰따옴표, 줄바꿈(\n) 모두 그대로 유지
- 공백 없이 정확히 복사

### 4-3. .gitignore 확인
`.gitignore` 파일에 다음 추가:
```
.env
*.json
```

✅ 로컬 환경 변수 설정 완료!

---

## 5. Vercel 배포 설정 (3분)

### 5-1. Vercel Dashboard 접속
https://vercel.com/dashboard

### 5-2. 프로젝트 선택
배포된 프로젝트 클릭

### 5-3. Environment Variables 설정
1. **Settings** → **Environment Variables** 메뉴
2. 다음 변수들 추가:

**변수 1: TELEGRAM_BOT_TOKEN**
```
Name: TELEGRAM_BOT_TOKEN
Value: 7224856037:AAF...
Environments: ✅ Production, ✅ Preview, ✅ Development
```

**변수 2: TELEGRAM_CHAT_ID**
```
Name: TELEGRAM_CHAT_ID
Value: -1002...
Environments: ✅ Production, ✅ Preview, ✅ Development
```

**변수 3: FIREBASE_SERVICE_ACCOUNT** ⭐ 중요!
```
Name: FIREBASE_SERVICE_ACCOUNT
Value: {"type":"service_account",...전체 JSON 내용...}
Environments: ✅ Production, ✅ Preview, ✅ Development
```

⚠️ **FIREBASE_SERVICE_ACCOUNT 입력 시 주의**:
- JSON 파일 전체를 한 줄로 복사
- 줄바꿈, 공백 모두 유지
- 큰따옴표(") 확인

### 5-4. 재배포
1. **Deployments** 탭
2. 최신 배포 → **... 메뉴** → **Redeploy**
3. 완료!

✅ Vercel 환경 변수 설정 완료!

---

## 6. Firestore 보안 규칙 설정 (2분)

### 6-1. Firebase Console → Firestore → 규칙
왼쪽 메뉴 → **Firestore Database** → **규칙** 탭

### 6-2. 규칙 입력
다음 규칙 복사해서 붙여넣기:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 후기 컬렉션
    match /comments/{commentId} {
      allow read: if true;  // 누구나 읽기 가능
      allow write: if true; // 누구나 작성 가능 (나중에 인증 추가)
    }
    
    // 지원서 컬렉션
    match /applications/{applicationId} {
      allow read: if false;  // 관리자만 읽기
      allow write: if true;  // 누구나 작성 가능
    }
    
    // 예약 컬렉션
    match /bookings/{bookingId} {
      allow read: if false;  // 관리자만 읽기
      allow write: if true;  // API에서 작성
    }
  }
}
```

### 6-3. "게시" 버튼 클릭

✅ 보안 규칙 설정 완료!

---

## 7. 테스트 (5분)

### 7-1. 로컬 테스트
```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

### 7-2. 후기 등록 테스트
1. http://localhost:3000 접속
2. 카카오 로그인
3. 후기 작성
4. **Firebase Console → Firestore** 확인
5. **Telegram** 알림 확인

### 7-3. 시터 지원 테스트
1. 시터 지원하기 클릭
2. 양식 작성 후 제출
3. **Firebase Console → Firestore → applications** 확인
4. **Telegram** 알림 확인

✅ 모든 기능 정상 작동!

---

## 8. 문제 해결

### 문제 1: Firebase 초기화 실패
**에러**: "Firebase initialization error"

**해결**:
1. `.env` 파일 확인 (FIREBASE_SERVICE_ACCOUNT)
2. JSON 형식 검증 (https://jsonlint.com/)
3. Vercel 환경 변수 재확인

### 문제 2: Firestore 권한 오류
**에러**: "Permission denied"

**해결**:
1. Firebase Console → Firestore → 규칙 확인
2. 규칙 재설정 후 "게시"

### 문제 3: Telegram 알림 안 옴
**해결**:
1. TELEGRAM_BOT_TOKEN 확인
2. TELEGRAM_CHAT_ID 확인 (- 기호 포함)
3. Vercel 환경 변수 재확인

---

## 9. 완료! 🎉

### ✅ 체크리스트
- [ ] Firebase 프로젝트 생성
- [ ] Firestore Database 설정
- [ ] 서비스 계정 키 다운로드
- [ ] .env 파일 작성
- [ ] Vercel 환경 변수 설정
- [ ] Firestore 보안 규칙 설정
- [ ] npm install
- [ ] 로컬 테스트
- [ ] Vercel 재배포
- [ ] 후기/지원/예약 테스트

### 🎊 축하합니다!
**데이터가 영구 저장되는 시스템 완성!**

이제 서버 재시작해도 데이터가 안 날아갑니다! 💪

---

**문의**: 문제가 생기면 이 가이드 다시 확인!
