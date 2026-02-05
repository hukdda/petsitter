# 🔧 펫시터의 정석 - 수정사항 요약

## 📋 전체 수정 파일 목록

### 🆕 신규 생성
1. **services/api.ts** - 프론트엔드 API 클라이언트 (최우선 필수!)

### ✏️ 수정됨
2. **types.ts** - 복잡한 ApplicationData 타입
3. **pages/Home.tsx** - Trust Section 버전3
4. **pages/Apply.tsx** - 복잡한 도그메이트 스타일 지원서
5. **pages/Calculator.tsx** - 불연속 날짜 + 하루 2회 방문

---

## 🎯 파일별 상세 변경 내용

### 1. services/api.ts (신규 생성) ⚠️ 최우선!
```
경로: src/services/api.ts
상태: 완전히 새로 생성
중요도: ★★★★★ (없으면 작동 안 함!)
```

**변경 사유**:
- 모든 페이지가 `import { api } from '../services/api'`를 사용하는데 이 파일이 누락됨
- 프론트엔드와 백엔드 API 통신이 불가능했음

**주요 기능**:
- calculatePrice() - 가격 계산
- fetchComments() - 후기 조회
- submitComment() - 후기 등록
- submitApplication() - 지원서 제출
- verifyPayment() - 결제 검증
- socialLogin() - 카카오 로그인
- fetchAdminData() - 관리자 데이터

---

### 2. types.ts (수정)
```
경로: src/types.ts
변경 범위: ApplicationData 인터페이스
중요도: ★★★★☆
```

**변경 전** (간결한 버전):
```typescript
export interface ApplicationData {
  name: string;
  phone: string;
  address: string;
  petExperience: string;
  motivation: string;
  agreedToTerms: boolean;
}
```

**변경 후** (복잡한 도그메이트 스타일):
```typescript
export interface ApplicationData {
  // 기본 정보 (7개)
  name: string;
  phone: string;
  birthDate: string;
  gender: string;
  isSmoker: boolean;
  address: string;
  addressDetail: string;
  
  // 거주 정보 (2개)
  residenceType: string;
  hasPet: string;
  
  // 직업 정보 (3개)
  currentJob: string;
  currentJobDirect?: string;
  canDeclareIncome: boolean;
  
  // 활동 정보 (6개)
  activeDaysPerMonth: string;
  availableDays: string[];
  availableTimes: string[];
  availableTimesDirect?: string;
  activityRegion: string;
  transportation: string;
  
  // 반려동물 경험 (5개)
  catExperience: string;
  dogExperience: string;
  otherPetExp: string;
  industryExp: string;
  sitterHistory: string;
  
  // 지원 동기 (3개)
  motivation: string;
  discoveryPath: string;
  discoveryPathDirect?: string;
  
  // 동의 사항 (6개)
  agreedToProgram: boolean;
  agreedToFee: boolean;
  noCriminalRecord: boolean;
  smokingPledge: boolean;
  safetyPledge: boolean;
  signature: string;
}
```

**추가 변경**: BookingData에도 새 필드 추가
- `visitsPerDay?: number` - 하루 방문 횟수
- `selectedDates?: string[]` - 불연속 날짜 배열

---

### 3. pages/Home.tsx (수정)
```
경로: src/pages/Home.tsx
변경 범위: Trust Section (line 189-201)
중요도: ★★★☆☆
```

**변경 전** (3개 항목):
```javascript
{ title: '철저한 신원확인', desc: '거주지 확인 및 신분증 대조 완료', icon: '🛡️' },
{ title: '대표 직접 면접', desc: '1:1 대면 면접을 통과한 분만 활동', icon: '👥' },
{ title: '실시간 돌봄톡', desc: '돌봄 중 사진과 영상을 실시간 전송', icon: '📱' }
```

**변경 후** (4개 항목 - 정직한 버전):
```javascript
{ title: '체계적인 지원 관리', desc: '시터 경력과 반려동물 경험 상세 확인', icon: '📋' },
{ title: '지역 기반 매칭', desc: '거주지 근처의 적합한 시터 연결', icon: '🗺️' },
{ title: '돌봄 순간 기록', desc: '사진과 메시지로 전달되는 우리 아이 소식', icon: '💙' },
{ title: '진실한 후기 시스템', desc: '과장 없는 실제 이용자들의 솔직한 평가', icon: '✨' }
```

**레이아웃 변경**:
```javascript
// 변경 전: 3개 컬럼
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">

// 변경 후: 4개 컬럼 (반응형)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
```

**변경 이유**:
- 신원확인 → 실제로 하지 않음
- 대면 면접 → 실제로 하지 않음
- 범죄경력 조회 → 방법을 모름
- 책임 보험 → 가입되지 않음
⇒ **정직하고 실제 제공 가능한 서비스만 표시**

---

### 4. pages/Apply.tsx (완전 재작성)
```
경로: src/pages/Apply.tsx
변경 범위: 전체 파일 (98줄 → 637줄)
중요도: ★★★★★
```

**변경 전**: 간결한 5개 필드
- 성함, 연락처, 거주 지역, 반려동물 경험, 동의 체크박스

**변경 후**: 복잡한 도그메이트 스타일 (8개 섹션)

#### 섹션 1: 기본 정보
- 성명, 연락처, 생년월일, 성별
- 흡연 여부 체크박스

#### 섹션 2: 거주 정보
- 주소, 상세 주소
- 거주 형태 (아파트/빌라/단독주택/오피스텔/기타)
- 반려동물 보유 여부

#### 섹션 3: 직업 정보
- 현재 직업 (학생/직장인/프리랜서/주부/무직/기타)
- 기타 선택 시 직접 입력
- 소득 신고 가능 여부 (3.3% 원천징수)

#### 섹션 4: 활동 정보
- 월 활동 가능 일수 (주 1~2회 / 주 3~4회 / 주 5회 이상 / 매일)
- 활동 가능 요일 (월~일 다중 선택)
- 활동 가능 시간대 (오전/오후/저녁/야간 다중 선택)
- 주 활동 지역
- 이동 수단 (자가용/대중교통/도보/자전거·킥보드/기타)

#### 섹션 5: 반려동물 경험
- 고양이 돌봄 경험 (textarea)
- 강아지 돌봄 경험 (textarea)
- 기타 동물 돌봄 경험 (textarea)
- 업계 종사 경험 (textarea)
- 펫시터 활동 이력 (textarea)

#### 섹션 6: 지원 동기
- 지원 이유 (textarea)
- 발견 경로 (지인 추천/검색/SNS/당근마켓/기타)
- 기타 선택 시 직접 입력

#### 섹션 7: 필수 동의 사항
- ✅ 교육 프로그램 참여 동의
- ✅ 플랫폼 수수료 정책 동의 (30%)
- ✅ 동물 관련 범죄 경력 없음 확인
- ✅ 돌봄 중 절대 흡연하지 않을 것 서약
- ✅ 안전 수칙 준수 및 사고 발생 시 즉시 보고 서약

#### 섹션 8: 전자 서명
- 성명 입력 (서명으로 대체)
- 허위 사실 발견 시 활동 제한 동의

**총 30개+ 필드** 수집

---

### 5. pages/Calculator.tsx (대폭 개선)
```
경로: src/pages/Calculator.tsx
변경 범위: 전체 파일 (176줄 → 553줄)
중요도: ★★★★★
```

#### 신기능 1: 불연속 날짜 선택
```
체크박스 달력 UI 추가:
- 원하는 날짜만 체크박스로 선택 가능
- 예: 3/1, 3/3, 3/5, 3/10 (4일만 선택)
- 선택한 날짜 수만큼 정확히 비용 계산
- 달력 범위는 시작일~종료일로 설정
```

#### 신기능 2: 하루 2회 방문
```
체크박스 옵션 추가:
- "하루 2회 방문 (오전 + 저녁)"
- 기본 요금 × 2배 자동 계산
- 할증 항목에 "하루 2회 방문" 표시
```

#### 개선사항
- 당일 할증 UI 명확화
- 반려동물 수에 따른 할증 설명 추가
- 방문 시간대별 야간 할증 안내
- 선택한 날짜 수 실시간 표시
- 할증 항목 뱃지 형태로 명확히 표시

#### 사용자 흐름
```
Step 1 (ESTIMATE):
- 서비스 선택
- ☑️ 하루 2회 방문 옵션
- ☑️ 불연속 날짜 선택 모드
  - OFF: 시작일~종료일 입력 (연속)
  - ON: 달력에서 원하는 날짜만 체크
- 반려동물 수
- 방문 시간
- 💰 실시간 가격 표시 + 할증 항목

Step 2 (INFO):
- 예약자 정보 입력

Step 3 (PAYMENT):
- 무통장 입금 안내

Step 4 (SUCCESS):
- 예약 완료
```

---

## 🚨 주의사항

### 반드시 확인!
1. **services/api.ts 파일이 없으면 절대 작동 안 됩니다!**
2. 기존 파일은 백업 필수 (src_backup 폴더 생성 권장)
3. types.ts의 ApplicationData 변경으로 Apply.tsx도 반드시 함께 교체

### 배포 전 체크리스트
- [ ] services/api.ts 파일 존재 확인
- [ ] npm install 실행
- [ ] npm run dev로 로컬 테스트
- [ ] Trust Section 4개 항목 표시 확인
- [ ] Apply 페이지 30개+ 필드 확인
- [ ] Calculator 불연속 날짜 선택 테스트
- [ ] Calculator 하루 2회 방문 테스트
- [ ] 가격 계산 정확성 확인
- [ ] npm run build 성공 확인
- [ ] Vercel 배포

---

## 📞 문제 발생 시

### 자주 발생하는 오류
1. **"Cannot find module '../services/api'"**
   - 해결: services/api.ts 파일이 누락됨. 반드시 추가!

2. **"Property 'birthDate' does not exist on type..."**
   - 해결: types.ts가 업데이트되지 않음. types.ts 교체!

3. **가격 계산이 이상해요**
   - 확인: calculate-price.js에 당일 할증 로직 있는지 확인
   - 위치: /api/calculate-price.js line 51

4. **불연속 날짜가 작동 안 해요**
   - 확인: Calculator.tsx가 최신 버전인지 확인
   - 필수: useCustomDates 상태 및 toggleDate 함수 존재 여부

---

## 🎉 완료!

**모든 파일이 정상적으로 교체되면**:
✅ 프론트엔드-백엔드 통신 정상 작동
✅ Trust Section 4개 항목 표시
✅ Apply 페이지 30개+ 필드 수집
✅ Calculator 불연속 날짜 선택 가능
✅ Calculator 하루 2회 방문 옵션 가능
✅ 가격 계산 정확성 향상

**최고의 펫시터 플랫폼 완성!** 🚀
