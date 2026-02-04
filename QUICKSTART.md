# 🚀 빠른 시작 가이드

## 📦 설치 (5분 완료)

### 1. 프로젝트 압축 풀기
```bash
unzip lovelypetsitter-complete.zip
cd lovelypetsitter-complete
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
# .env.example을 .env로 복사
cp .env.example .env

# .env 파일 편집 (Telegram 토큰 입력)
nano .env
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속!

---

## 🌐 배포 (Vercel)

### 방법 1: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

### 방법 2: GitHub 연동
1. GitHub에 푸시
2. Vercel 대시보드에서 Import
3. 환경 변수 설정 (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID)
4. Deploy!

---

## ✅ 체크리스트

배포 전 확인사항:
- [ ] npm install 성공
- [ ] npm run dev 실행 확인
- [ ] Trust Section 4개 항목 표시
- [ ] Apply 페이지 열림 (30개+ 필드)
- [ ] Calculator 불연속 날짜 선택 가능
- [ ] Calculator 하루 2회 방문 옵션
- [ ] 후기 등록 테스트
- [ ] Telegram 알림 테스트
- [ ] npm run build 성공

---

## 🆘 문제 해결

### "Cannot find module 'react'"
```bash
npm install
```

### "services/api.ts not found"
→ src/services/api.ts 파일 확인

### Telegram 알림 안 옴
→ .env 파일에 올바른 토큰 입력했는지 확인

### 가격 계산이 이상함
→ api/calculate-price.js 파일 확인

---

## 📞 지원

문제가 계속되면:
1. README.md 읽기
2. MODIFICATIONS_SUMMARY.md 읽기
3. 대표님께 연락

**성공적인 배포를 기원합니다!** 🎉
