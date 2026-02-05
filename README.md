<<<<<<< HEAD
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ZjsLWgU9I7zoBKFqPfejfKFd0mfmmKgB

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
=======
# 펫시터의 정석

전문 반려동물 방문 돌봄 플랫폼

## 🚀 빠른 시작

### 1. 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 다음 내용을 입력하세요:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
KAKAO_CLIENT_ID=4e82f00882c1c24d0b83c1e001adce2f
```

### 3. 로컬 개발 서버 실행
```bash
npm run dev
```

### 4. Vercel 배포

#### GitHub 저장소 생성 및 푸시
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/petsitter.git
git push -u origin main
```

#### Vercel 배포
1. https://vercel.com 접속
2. "New Project" 클릭
3. GitHub 저장소 선택 (`YOUR_USERNAME/petsitter`)
4. Framework Preset: **Vite** 선택
5. Build Settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Environment Variables 추가:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `KAKAO_CLIENT_ID`
7. **Deploy** 클릭

## 📁 프로젝트 구조

```
petsitter-clean/
├── api/                    # Vercel Serverless Functions
│   ├── _db.js             # Mock 데이터베이스
│   ├── services.js        # 가격계산, 후기, 지원서 API
│   ├── payment.js         # 결제 검증 API
│   ├── auth.js            # 카카오 로그인 API
│   └── admin.js           # 관리자 데이터 API
├── src/
│   ├── components/        # React 컴포넌트
│   ├── pages/             # 페이지 컴포넌트
│   ├── services/          # API 클라이언트
│   ├── App.tsx            # 메인 앱
│   ├── main.tsx           # 엔트리 포인트
│   ├── types.ts           # TypeScript 타입
│   └── constants.tsx      # 상수 정의
├── public/                # 정적 파일
├── index.html             # HTML 템플릿
├── vercel.json            # Vercel 설정
├── package.json           # 의존성
└── vite.config.ts         # Vite 설정
```

## ✅ API 엔드포인트

- **GET** `/api/services?path=comments` - 후기 목록 조회
- **POST** `/api/services?path=comments` - 후기 등록
- **POST** `/api/services?path=calculate-price` - 가격 계산
- **POST** `/api/services?path=applications` - 펫시터 지원서 접수
- **POST** `/api/payment` - 결제 검증 (무통장 입금)
- **POST** `/api/auth` - 카카오 소셜 로그인
- **GET** `/api/admin?path=data` - 관리자 데이터 조회

## 🔧 기술 스택

- **Frontend**: React 19, TypeScript, Tailwind CSS, React Router
- **Build Tool**: Vite 6
- **Backend**: Vercel Serverless Functions
- **Deployment**: Vercel
- **Notifications**: Telegram Bot API
- **Authentication**: Kakao Login

## 📝 주요 기능

1. **실시간 가격 계산**
   - 기본 요금 + 할증(주말/명절/성수기/야간/다견)
   - 날짜별 자동 할증 계산

2. **무통장 입금 예약**
   - 입금자명 입력
   - 텔레그램 알림 발송

3. **카카오 소셜 로그인**
   - 간편 회원가입/로그인

4. **펫시터 지원**
   - 상세 지원서 양식
   - 자동 알림

5. **관리자 대시보드**
   - 예약 현황
   - 지원서 관리
   - 통계

## ⚠️ 중요 사항

### Vercel 배포 시 주의사항

1. **Output Directory**: 반드시 `dist`로 설정
2. **API 파일 개수**: Hobby 플랜은 최대 12개 제한 (현재 4개 사용)
3. **환경 변수**: Vercel 대시보드에서 설정 필요

### 파일 개수 제한

**현재 API 파일 (4개)**:
- services.js
- payment.js
- auth.js
- admin.js

**절대 추가하지 말 것**:
- calculate-price.js (services.js와 중복)
- comments.js (services.js와 중복)
- verify-payment.js (payment.js와 중복)

## 🔗 링크

- **배포 사이트**: https://petsitter.vercel.app
- **관리자**: https://petsitter.vercel.app/admin (비밀번호: admin1234)

## 📞 문의

- **대표**: 박문기
- **전화**: 0507-1344-6573
- **이메일**: daegupetsit@naver.com
>>>>>>> eb423f517925f7b12f1d3f3e160c6f538480f8cc
