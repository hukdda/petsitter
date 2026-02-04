
import { ServiceOption } from './types.ts';

export const SERVICE_OPTIONS: ServiceOption[] = [
  { id: '30m', name: '방문 돌봄 30분', basePrice: 18000 },
  { id: '60m', name: '방문 돌봄 60분', basePrice: 25000 },
  { id: '90m', name: '방문 돌봄 90분', basePrice: 32000 },
  { id: '120m', name: '방문 돌봄 120분', basePrice: 39000 },
  { id: 'bath', name: '방문 목욕 (소형견)', basePrice: 50000 },
];

export const REGIONS = [
  '전체', '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', 
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
];

/**
 * 플랫폼 수수료율 (30%)
 * 모든 예약 결제 시 총 금액의 30%가 플랫폼 수익으로 계산됩니다.
 */
export const PLATFORM_FEE_RATE = 0.30;
