/**
 * 펫시터의 정석 - 상수 정의
 */

// 서비스 옵션 (가격표)
export const SERVICE_OPTIONS = [
  { id: 'visit-30', name: '방문 돌봄 30분', basePrice: 18000, duration: 30 },
  { id: 'visit-60', name: '방문 돌봄 60분', basePrice: 25000, duration: 60 },
  { id: 'visit-90', name: '방문 돌봄 90분', basePrice: 32000, duration: 90 },
  { id: 'visit-120', name: '방문 돌봄 120분', basePrice: 39000, duration: 120 },
  { id: 'bath-small', name: '방문 목욕 (소형견)', basePrice: 50000, duration: 90 },
];

// 지역 목록
export const REGIONS = [
  '서울',
  '부산',
  '대구',
  '인천',
  '광주',
  '대전',
  '울산',
  '세종',
  '경기',
  '강원',
  '충북',
  '충남',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
];

// 플랫폼 수수료율 (30%)
export const PLATFORM_FEE_RATE = 0.30;

// 할증 정책
export const SURCHARGE_RATES = {
  SAME_DAY: 10000, // 당일 예약
  PEAK_SEASON: 5000, // 성수기
  WEEKEND: 5000, // 주말/공휴일
  NIGHT: 5000, // 야간 (20:00~08:00)
  HOLIDAY: 10000, // 명절 (설/추석)
  EXTRA_PET: 5000, // 다견/다묘 (2마리부터)
};

// 공휴일 목록 (YYYY-MM-DD)
export const PUBLIC_HOLIDAYS = [
  '2025-01-01', // 신정
  '2025-02-28', '2025-03-01', '2025-03-02', // 설날
  '2025-03-01', // 삼일절
  '2025-05-05', // 어린이날
  '2025-06-06', // 현충일
  '2025-08-15', // 광복절
  '2025-10-03', '2025-10-04', '2025-10-05', // 추석
  '2025-10-09', // 한글날
  '2025-12-25', // 크리스마스
  '2026-01-01', // 신정
];

// 카카오 로그인 설정
export const KAKAO_CLIENT_ID = '4e82f00882c1c24d0b83c1e001adce2f';

// 회사 정보
export const COMPANY_INFO = {
  name: '펫시터의 정석',
  representative: '박문기',
  businessNumber: '561-23-02161',
  phone: '0507-1344-6573',
  bankAccount: {
    bank: '대구은행',
    number: '5081-3446-573',
    holder: '박문기(펫시터의정석)',
  },
  kakaoId: '_FgxjQn',
};

// 성수기 기간 체크 함수
export function isPeakSeason(date: Date): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 5월 1일~5일 (어린이날 연휴)
  if (month === 5 && day >= 1 && day <= 5) return true;
  
  // 7월 20일 ~ 8월 15일 (여름 휴가철)
  if ((month === 7 && day >= 20) || (month === 8 && day <= 15)) return true;
  
  return false;
}

// 야간 시간대 체크 함수
export function isNightTime(time: string): boolean {
  const hour = parseInt(time.split(':')[0]);
  return hour >= 20 || hour < 8;
}

// 주말 체크 함수
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 일요일(0) 또는 토요일(6)
}

// 공휴일 체크 함수
export function isPublicHoliday(date: Date): boolean {
  const dateStr = date.toISOString().split('T')[0];
  return PUBLIC_HOLIDAYS.includes(dateStr);
}
