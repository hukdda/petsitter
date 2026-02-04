/**
 * 펫시터의 정석 - API 클라이언트
 * 모든 백엔드 API 통신을 담당합니다.
 */

const API_BASE = '/api';

/**
 * 가격 계산 API
 */
export const calculatePrice = async (data: {
  basePrice: number;
  startDate: string;
  endDate: string;
  petCount: number;
  visitTime?: string;
}) => {
  try {
    const response = await fetch(`${API_BASE}/calculate-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('가격 계산 실패');
    return await response.json();
  } catch (error) {
    console.error('Calculate Price Error:', error);
    throw error;
  }
};

/**
 * 후기 조회 API
 */
export const fetchComments = async () => {
  try {
    const response = await fetch(`${API_BASE}/comments`);
    if (!response.ok) throw new Error('후기 조회 실패');
    return await response.json();
  } catch (error) {
    console.error('Fetch Comments Error:', error);
    return [];
  }
};

/**
 * 후기 등록 API
 */
export const submitComment = async (data: {
  author: string;
  region: string;
  content: string;
}) => {
  try {
    const response = await fetch(`${API_BASE}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('후기 등록 실패');
    return await response.json();
  } catch (error) {
    console.error('Submit Comment Error:', error);
    throw error;
  }
};

/**
 * 펫시터 지원서 제출 API
 */
export const submitApplication = async (data: any) => {
  try {
    const response = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('지원서 제출 실패');
    return await response.json();
  } catch (error) {
    console.error('Submit Application Error:', error);
    throw error;
  }
};

/**
 * 결제 검증 API
 */
export const verifyPayment = async (data: {
  imp_uid?: string;
  merchant_uid: string;
  amount: number;
  paymentMethod: 'CARD' | 'BANK';
  bookingData?: any;
  authno?: string;
}) => {
  try {
    const response = await fetch(`${API_BASE}/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('결제 검증 실패');
    return await response.json();
  } catch (error) {
    console.error('Verify Payment Error:', error);
    throw error;
  }
};

/**
 * 소셜 로그인 API (카카오)
 */
export const socialLogin = async (
  provider: string, 
  code: string, 
  redirectUri: string
) => {
  try {
    const response = await fetch(`${API_BASE}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirectUri })
    });
    
    if (!response.ok) throw new Error('로그인 실패');
    return await response.json();
  } catch (error) {
    console.error('Social Login Error:', error);
    throw error;
  }
};

/**
 * 관리자 데이터 조회 API
 */
export const fetchAdminData = async () => {
  try {
    const response = await fetch(`${API_BASE}/admin/data`);
    if (!response.ok) throw new Error('관리자 데이터 조회 실패');
    return await response.json();
  } catch (error) {
    console.error('Fetch Admin Data Error:', error);
    return null;
  }
};

/**
 * API 객체로 export (기존 코드 호환성)
 */
export const api = {
  calculatePrice,
  fetchComments,
  submitComment,
  submitApplication,
  verifyPayment,
  socialLogin,
  fetchAdminData
};

export default api;
