# ⚡ 빠른 시작 가이드 (5분 완료!)

## 🎉 Firebase 키를 이미 받으셨습니다!

이제 **3단계**만 하면 완전히 작동합니다!

---

## 1️⃣ 로컬 환경 설정 (2분)

### 프로젝트 압축 풀기
```bash
unzip lovelypetsitter-complete-firebase.zip
cd lovelypetsitter-complete
```

### .env 파일 생성
```bash
# .env.example을 .env로 복사
cp .env.example .env
```

**✅ 이미 Firebase 키가 들어있습니다!**

---

## 2️⃣ 패키지 설치 및 실행 (2분)

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

**✅ http://localhost:3000 접속!**

---

## 3️⃣ Vercel 배포 (1분)

### 환경 변수 설정
Vercel Dashboard → Settings → Environment Variables

**추가할 변수 3개:**

1. **TELEGRAM_BOT_TOKEN**
   ```
   7224856037:AAFZeD7Rkj6bJrVvN4Xe50KT_f0oMZ0qKGk
   ```

2. **TELEGRAM_CHAT_ID**
   ```
   -1002395092932
   ```

3. **FIREBASE_SERVICE_ACCOUNT** (중요!)
   ```
   {"type":"service_account","project_id":"lovely-pet-sitter",...전체 JSON...}
   ```
   ⚠️ .env 파일에서 FIREBASE_SERVICE_ACCOUNT 값 전체 복사!

### 재배포
```bash
vercel --prod
```

---

## ✅ 완료! 테스트하기

### 1. 후기 등록 테스트
1. 홈페이지 접속
2. 카카오 로그인
3. 후기 작성
4. **Telegram 알림 확인** (전담 실장님 표현)
5. **Firebase Console → reservations 컬렉션 확인**

### 2. 예약 테스트
1. 가격 계산
2. 예약 정보 입력
3. 무통장 입금 선택
4. **Telegram 알림 확인**
   - 총 금액
   - **플랫폼 수수료 (30%)**
   - **시터 수령액 (70%)**
5. **Firebase Console → reservations 확인**

---

## 🎯 핵심 기능 확인

### ✅ Firebase 연결
- 서버 재시작해도 데이터 유지
- 영구 저장

### ✅ 30% 수수료 자동 계산
```javascript
예약 금액: 100,000원
→ 플랫폼 수수료: 30,000원 (자동 계산)
→ 시터 수령액: 70,000원
```

### ✅ 보안 (방법 B)
- 모든 DB 접근은 서버에서만
- 클라이언트는 REST API만 호출
- Firebase 키는 서버에만 존재

### ✅ 전담 실장님 표현
- "AI"라는 단어 사용 안 함
- "전담 실장님이 매칭합니다"
- "스마트 관리 시스템"

---

## 🚨 문제 해결

### Firebase 오류 발생 시
1. FIREBASE_SERVICE_ACCOUNT 값 확인
2. JSON 형식 검증 (https://jsonlint.com/)
3. Vercel 환경 변수 재확인

### Telegram 알림 안 올 때
1. TELEGRAM_BOT_TOKEN 확인
2. TELEGRAM_CHAT_ID 확인 (- 기호 포함!)
3. 봇이 채팅방에 추가되어 있는지 확인

---

## 🎊 완료!

**데이터 영구 저장 + 30% 수수료 자동 계산 + 전담 실장님 시스템**

이제 진짜 실제 서비스 가능합니다! 🚀

**다음 단계**: 홈페이지 디자인 개선!
