import React from 'react';
import { ServiceOption } from './types'; // .ts 확장자를 제거하여 빌드 에러 방지

export const SERVICE_OPTIONS: ServiceOption[] = [
  { id: '30m', name: '방문 돌봄 30분', basePrice: 18000 },
  { id: '60m', name: '방문 돌봄 60분', basePrice: 25000 },
  { id: '90m', name: '방문 돌봄 90분', basePrice: 32000 },
  { id: '120m', name: '방문 돌봄 120분', basePrice: 39000 },
  { id: 'bath', name: '방문 목욕 (소형견)', basePrice: 50000 },
];

// 전국 주요 도시로 확장
export const REGIONS = [
  '전체', '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', 
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
];

// 대표님이 말씀하신 수수료 30% 반영!
export const PLATFORM_FEE_RATE = 0.3;