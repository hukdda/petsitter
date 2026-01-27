
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.ts';
import { SERVICE_OPTIONS } from '../constants.tsx';
import { PriceCalculationResult } from '../types.ts';

type Step = 'ESTIMATE' | 'INFO' | 'PAYMENT' | 'SUCCESS';

const Calculator: React.FC = () => {
  const [step, setStep] = useState<Step>('ESTIMATE');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PriceCalculationResult | null>(null);
  
  const [formData, setFormData] = useState({
    serviceId: SERVICE_OPTIONS[0].id,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    petCount: 1,
    userName: '',
    userPhone: '',
    address: '',
    visitTime: '10:00',
    petName: '',
    petBreed: '',
    request: '',
    paymentMethod: 'CARD' as 'CARD' | 'BANK',
    depositorName: ''
  });

  const calculate = useCallback(async () => {
    const service = SERVICE_OPTIONS.find(s => s.id === formData.serviceId);
    if (!service) return;
    setLoading(true);
    try {
      const res = await api.calculatePrice({
        basePrice: service.basePrice,
        startDate: formData.startDate,
        endDate: formData.endDate,
        petCount: formData.petCount,
        visitTime: formData.visitTime
      });
      setResult(res);
    } catch (e) {
      console.error('Price Calc Error:', e);
      setResult({ totalCost: service.basePrice, totalDays: 1, surcharges: [] });
    } finally {
      setLoading(false);
    }
  }, [formData.serviceId, formData.startDate, formData.endDate, formData.petCount, formData.visitTime]);

  useEffect(() => { if (step === 'ESTIMATE') calculate(); }, [calculate, step]);

  const handleBankPayment = async () => {
    if (!formData.depositorName) return alert('입금자명을 입력해 주세요.');
    setLoading(true);
    try {
      await api.verifyPayment({
        merchant_uid: result?.orderId || `BANK_${Date.now()}`,
        amount: result?.totalCost || 0,
        paymentMethod: 'BANK',
        bookingData: formData
      });
      setStep('SUCCESS');
    } catch (e) {
      alert('접수 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = () => {
    const win = window as any;
    const nex = win.NexPay || win.MePay || win.MagNexPay;
    if (!nex) return alert('결제 엔진을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');

    const bookingData = {
      ...formData,
      id: result?.orderId || `ORD_${Date.now()}`,
      totalCost: result?.totalCost || 0,
      serviceName: SERVICE_OPTIONS.find(s => s.id === formData.serviceId)?.name || ''
    };
    
    localStorage.setItem('pending_booking', JSON.stringify(bookingData));

    const params = {
      USERID: "DA77436573",
      PAYMETHOD: "CARD",
      ORDERNO: bookingData.id,
      AMOUNT: String(bookingData.totalCost),
      PRODUCTNAME: bookingData.serviceName,
      RETURNURL: window.location.origin + "/payment/callback",
      FAILURL: window.location.href,
      BUYERNAME: formData.userName,
      BUYERTEL: formData.userPhone
    };

    try {
      const payFn = nex.pay || nex.open || nex.request_pay;
      payFn.call(nex, params);
    } catch (e) {
      alert('결제창을 여는 중 오류가 발생했습니다.');
    }
  };

  if (step === 'SUCCESS') return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl border border-amber-100">
        <div className="text-7xl mb-8">🎉</div>
        <h2 className="text-3xl font-black mb-4">예약 접수 완료!</h2>
        <p className="text-gray-500 font-bold mb-10 text-sm leading-relaxed">
          {formData.paymentMethod === 'BANK' ? '입금 확인 후 예약이 최종 확정됩니다.' : '결제가 완료되어 예약이 확정되었습니다.'}<br/>
          전문 시터님이 배정되면 안내 문자를 드려요.
        </p>
        <button onClick={() => window.location.href = '/'} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black shadow-xl">홈으로 가기</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] pt-8 pb-32 px-4">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 relative overflow-hidden border border-gray-100">
          {loading && <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center"><div className="spinner"></div></div>}
          
          {step === 'ESTIMATE' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">돌봄 견적 확인</h2>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Service Type</label>
                  <select value={formData.serviceId} onChange={e => setFormData(p => ({...p, serviceId: e.target.value}))} className="w-full p-4 bg-gray-50 rounded-2xl font-black text-amber-900 outline-none">
                    {SERVICE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start Date</label>
                    <input type="date" value={formData.startDate} onChange={e => setFormData(p => ({...p, startDate: e.target.value}))} className="w-full p-4 bg-gray-50 rounded-2xl font-bold" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">End Date</label>
                    <input type="date" value={formData.endDate} onChange={e => setFormData(p => ({...p, endDate: e.target.value}))} className="w-full p-4 bg-gray-50 rounded-2xl font-bold" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pet Count</label>
                    <input type="number" min="1" value={formData.petCount} onChange={e => setFormData(p => ({...p, petCount: Number(e.target.value)}))} className="w-full p-4 bg-gray-50 rounded-2xl font-bold" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Time</label>
                    <input type="time" value={formData.visitTime} onChange={e => setFormData(p => ({...p, visitTime: e.target.value}))} className="w-full p-4 bg-gray-50 rounded-2xl font-bold" />
                  </div>
                </div>
              </div>
              <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 space-y-2">
                 <div className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Expected Total</div>
                 <div className="text-3xl font-[950] text-gray-900">{(result?.totalCost || 0).toLocaleString()}원</div>
                 {result?.surcharges && result.surcharges.length > 0 && (
                   <div className="flex flex-wrap gap-1 pt-2">
                     {result.surcharges.map((s, i) => (
                       <span key={i} className="text-[9px] font-black bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">{s}</span>
                     ))}
                   </div>
                 )}
              </div>
              <button onClick={() => setStep('INFO')} className="w-full bg-amber-700 text-white py-6 rounded-2xl font-black shadow-lg">예약 정보 입력하기</button>
            </div>
          )}

          {step === 'INFO' && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <h2 className="text-2xl font-black tracking-tight">정보 입력</h2>
              <div className="space-y-4">
                <input type="text" placeholder="예약자 성함" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.userName} onChange={e => setFormData(p => ({...p, userName: e.target.value}))} />
                <input type="tel" placeholder="연락처 (010-0000-0000)" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.userPhone} onChange={e => setFormData(p => ({...p, userPhone: e.target.value}))} />
                <input type="text" placeholder="방문 주소" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.address} onChange={e => setFormData(p => ({...p, address: e.target.value}))} />
                <div className="grid grid-cols-2 gap-4">
                   <input type="text" placeholder="아이 이름" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.petName} onChange={e => setFormData(p => ({...p, petName: e.target.value}))} />
                   <input type="text" placeholder="종류 (푸들 등)" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.petBreed} onChange={e => setFormData(p => ({...p, petBreed: e.target.value}))} />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('ESTIMATE')} className="flex-1 py-6 rounded-2xl font-bold border-2 border-gray-100 text-gray-400">이전</button>
                <button onClick={() => setStep('PAYMENT')} className="flex-[2] bg-amber-700 text-white py-6 rounded-2xl font-black shadow-lg">결제 진행</button>
              </div>
            </div>
          )}

          {step === 'PAYMENT' && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <h2 className="text-2xl font-black tracking-tight text-center">결제 수단 선택</h2>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => setFormData(p => ({...p, paymentMethod: 'CARD'}))} className={`p-6 rounded-[2rem] border-2 text-left flex items-center gap-4 transition-all ${formData.paymentMethod === 'CARD' ? 'border-amber-700 bg-amber-50 shadow-md' : 'border-gray-50 bg-white'}`}>
                  <span className="text-3xl">💳</span>
                  <div>
                    <div className="font-black text-sm text-gray-900">카드 간편 결제</div>
                    <div className="text-[10px] text-gray-400 font-bold">카드사 앱카드/간편결제 팝업</div>
                  </div>
                </button>
                <button onClick={() => setFormData(p => ({...p, paymentMethod: 'BANK'}))} className={`p-6 rounded-[2rem] border-2 text-left flex items-center gap-4 transition-all ${formData.paymentMethod === 'BANK' ? 'border-amber-700 bg-amber-50 shadow-md' : 'border-gray-50 bg-white'}`}>
                  <span className="text-3xl">🏦</span>
                  <div>
                    <div className="font-black text-sm text-gray-900">무통장 입금</div>
                    <div className="text-[10px] text-gray-400 font-bold">계좌 이체 (입금 확인 후 확정)</div>
                  </div>
                </button>
              </div>

              {formData.paymentMethod === 'BANK' && (
                <div className="bg-amber-50/50 p-8 rounded-3xl border border-amber-100 space-y-4">
                  <div className="text-center">
                    <div className="text-lg font-black text-amber-900">대구은행 5081-3446-573</div>
                    <div className="text-sm font-bold text-amber-700">예금주: 박문기(펫시터의정석)</div>
                  </div>
                  <input type="text" placeholder="입금자명" className="w-full p-4 bg-white rounded-xl font-black text-center shadow-sm" value={formData.depositorName} onChange={e => setFormData(p => ({...p, depositorName: e.target.value}))} />
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep('INFO')} className="flex-1 py-6 rounded-2xl font-bold border-2 border-gray-100 text-gray-400">이전</button>
                <button 
                  onClick={formData.paymentMethod === 'BANK' ? handleBankPayment : handleCardPayment} 
                  className="flex-[2] bg-gray-900 text-white py-6 rounded-2xl font-black shadow-xl"
                >
                  {(result?.totalCost || 0).toLocaleString()}원 {formData.paymentMethod === 'BANK' ? '예약 신청' : '결제 하기'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
