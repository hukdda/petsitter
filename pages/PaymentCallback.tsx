
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api.ts';

const PaymentCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const processPayment = async () => {
      const params = new URLSearchParams(location.search);
      const result = params.get('result') || params.get('res_cd');
      const orderId = params.get('orderno') || params.get('ORDERNO');
      const isMock = params.get('mock') === 'true';
      
      console.log('[DEBUG_CALLBACK_PARAMS]', Object.fromEntries(params.entries()));

      if (result === 'success' || result === '0000') {
        try {
          const pendingBookingStr = localStorage.getItem('pending_booking');
          
          if (pendingBookingStr) {
            const bookingData = JSON.parse(pendingBookingStr);
            
            const verifyRes = await api.verifyPayment({
              imp_uid: params.get('authno') || (isMock ? 'MOCK_SUCCESS' : 'DAOU_PAY'),
              merchant_uid: orderId || bookingData.id,
              amount: bookingData.totalCost,
              paymentMethod: 'CARD',
              bookingData: { 
                ...bookingData, 
                status: 'PAID', 
                paidAt: new Date().toISOString(),
                is_mock: isMock
              }
            });

            if (verifyRes.success) {
              localStorage.removeItem('pending_booking');
              setStatus('success');
              setTimeout(() => navigate('/calculator?step=SUCCESS'), 500);
            } else {
              throw new Error("결제 검증 서버 응답 실패");
            }
          } else {
            // 브라우저 캐시가 날아갔을 경우, 주문번호만으로 최소한의 처리 시도
            if (orderId) {
              setStatus('success');
              navigate('/');
            } else {
              throw new Error("결제 정보(세션)를 찾을 수 없습니다.");
            }
          }
        } catch (e: any) {
          console.error('[CALLBACK_FATAL]', e);
          setStatus('error');
          setErrorMsg(e.message || "결제 데이터 처리 중 오류가 발생했습니다.");
        }
      } else {
        setStatus('error');
        setErrorMsg(params.get('res_msg') || params.get('message') || "결제가 취소되었거나 실패하였습니다.");
      }
    };

    processPayment();
  }, [location, navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#fdfaf5] p-6 text-center">
      {status === 'loading' && (
        <div className="animate-in fade-in duration-500">
          <div className="spinner mb-6 w-12 h-12 border-t-amber-700 mx-auto"></div>
          <h2 className="text-xl font-black text-amber-900">결제 승인 정보를 확인 중입니다...</h2>
          <p className="text-gray-400 mt-2 font-bold text-sm">페이지를 닫지 마세요.</p>
        </div>
      )}
      {status === 'error' && (
        <div className="max-w-md bg-white p-10 rounded-[2.5rem] shadow-xl border border-red-100 animate-in zoom-in-95 duration-300">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-black text-red-600 mb-2">결제 처리 오류</h2>
          <p className="text-gray-500 font-medium mb-8 text-sm leading-relaxed">{errorMsg}</p>
          <button 
            onClick={() => navigate('/calculator')}
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all"
          >
            다시 시도하기
          </button>
        </div>
      )}
      {status === 'success' && (
        <div className="text-center">
          <div className="spinner mb-6 w-12 h-12 border-t-green-600 mx-auto"></div>
          <h2 className="text-xl font-black text-green-700">예약이 확정되었습니다!</h2>
          <p className="text-gray-400 mt-2 font-bold">잠시 후 완료 페이지로 이동합니다.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentCallback;
