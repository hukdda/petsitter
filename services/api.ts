
import { PriceCalculationResult, CommentData, PaymentVerificationRequest } from '../types.ts';

const safeFetch = async (url: string, options?: RequestInit) => {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type");
    let data;
    
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      console.error(`[API ERROR] URL: ${url} | Status: ${res.status}`, data);
      const error: any = new Error(typeof data === 'object' ? (data.message || `서버 오류 (${res.status})`) : data);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error(`[FETCH FATAL] URL: ${url}`, err);
    throw err;
  }
};

export const api = {
  calculatePrice: async (params: any): Promise<PriceCalculationResult> => {
    return safeFetch('/api/calculate-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
  },
  
  verifyPayment: async (req: PaymentVerificationRequest): Promise<any> => {
    return safeFetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
  },

  // 카드 수기결제 요청 추가
  requestSugiPayment: async (req: any): Promise<any> => {
    return safeFetch('/api/payment/card-sugi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
  },

  socialLogin: async (provider: string, code: string, redirectUri: string): Promise<any> => {
    return safeFetch('/api/auth/social', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, code, redirectUri })
    });
  },

  fetchComments: async (): Promise<CommentData[]> => {
    try {
      const data = await safeFetch('/api/comments');
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  },
  
  submitComment: async (data: any): Promise<any> => {
    return safeFetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  submitApplication: async (data: any): Promise<any> => {
    return safeFetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  fetchAdminData: async (): Promise<any> => {
    return safeFetch('/api/admin/data');
  },

  testTelegram: async (): Promise<any> => {
    return safeFetch('/api/test-telegram', {
      method: 'POST'
    });
  }
};
