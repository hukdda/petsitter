
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { SERVICE_OPTIONS, PLATFORM_FEE_RATE } from '../constants';
import { PriceCalculationResult } from '../types';

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
      setResult({ totalCost: service.basePrice, totalDays: 1, surcharges: [] });
    } finally {
      setLoading(false);
    }
  }, [formData.serviceId, formData.startDate, formData.endDate, formData.petCount, formData.visitTime]);

  useEffect(() => { if (step === 'ESTIMATE') calculate(); }, [calculate, step]);

  const handleBookingSubmit = async () => {
    if (!formData.depositorName) return alert('입금자명을 입력해 주세요.');
    setLoading(true);
    
    // 수수료 로직: 총 금액에서 30%는 플랫폼 수익, 나머지는 시터 정산금
    const totalCost = result?.totalCost || 0;
    const platformFee = Math.floor(totalCost * PLATFORM_FEE_RATE);
    const sitterAmount = totalCost - platformFee;

    try {
      await api.verifyPayment({
        merchant_uid: result?.orderId || `PET_${Date.now()}`,
        amount: totalCost,
        paymentMethod: 'BANK',
        bookingData: {
          ...formData,
          totalCost,
          platformFee,
          sitterAmount,
          managedBy: "전담 실장님",
          serviceName: SERVICE_OPTIONS.find(s => s.id === formData.serviceId)?.name || "방문 돌봄"
        }
      });
      setStep('SUCCESS');
    } catch (e) {
      alert('예약 접수 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'SUCCESS') return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl border border-amber-100">
        <div className="text-7xl mb-8">💌</div>
        <h2 className="text-3xl font-black mb-4">예약 신청 완료!</h2>
        <p className="text-gray-500 font-bold mb-10 text-sm leading-relaxed">
          입금자명 <span className="text-amber-700 font-black">[{formData.depositorName}]</span>으로 확인 부탁드립니다.<br/>
          <span className="text-amber-900 font-black">전담 실장님</span>이 확인 즉시 안내 문자를 발송해 드립니다.
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
            <div className="space-y-8">
              <h2 className="text-2xl font-black tracking-tight">실시간 견적 확인</h2>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">서비스 선택</label>
                  <select value={formData.serviceId} onChange={e => setFormData(p => ({...p, serviceId: e.target.value}))} className="w-full p-4 bg-gray-50 rounded-2xl font-black text-amber-900 outline-none">
                    {SERVICE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">시작일</label>
                    <input type="date" value={formData.startDate} onChange={e => setFormData(p => ({...p, startDate: e.target.value}))} className="w-full p-4 bg-gray-50 rounded-2xl font-bold" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">종료일</label>
                    <input type="date" value={formData.endDate} onChange={e => setFormData(p => ({...p, endDate: e.target.value}))} className="w-full p-4 bg-gray-50 rounded-2xl font-bold" />
                  </div>
                </div>
              </div>
              <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100 text-center">
                 <div className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Estimated Amount</div>
                 <div className="text-4xl font-[950] text-gray-900">{(result?.totalCost || 0).toLocaleString()}원</div>
                 {result?.surcharges && result.surcharges.length > 0 && (
                   <div className="flex flex-wrap justify-center gap-1 mt-3">
                     {result.surcharges.map((s, i) => (
                       <span key={i} className="text-[9px] font-black bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">{s}</span>
                     ))}
                   </div>
                 )}
              </div>
              <button onClick={() => setStep('INFO')} className="w-full bg-amber-700 text-white py-6 rounded-2xl font-black shadow-lg">예약 정보 입력하기 →</button>
            </div>
          )}

          {step === 'INFO' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black tracking-tight">예약자 정보</h2>
              <div className="space-y-4">
                <input type="text" placeholder="예약자 성함" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.userName} onChange={e => setFormData(p => ({...p, userName: e.target.value}))} />
                <input type="tel" placeholder="연락처 (010-0000-0000)" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.userPhone} onChange={e => setFormData(p => ({...p, userPhone: e.target.value}))} />
                <input type="text" placeholder="방문 주소" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.address} onChange={e => setFormData(p => ({...p, address: e.target.value}))} />
                <div className="grid grid-cols-2 gap-4">
                   <input type="text" placeholder="아이 이름" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.petName} onChange={e => setFormData(p => ({...p, petName: e.target.value}))} />
                   <input type="text" placeholder="견종/묘종" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.petBreed} onChange={e => setFormData(p => ({...p, petBreed: e.target.value}))} />
                </div>
              </div>
              <button onClick={() => setStep('PAYMENT')} className="w-full bg-amber-700 text-white py-6 rounded-2xl font-black shadow-lg">입금 계좌 확인 →</button>
            </div>
          )}

          {step === 'PAYMENT' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black tracking-tight text-center">무통장 입금 안내</h2>
              <div className="bg-amber-50/50 p-10 rounded-[3rem] border border-amber-100 text-center space-y-4">
                 <div className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Bank Info</div>
                 <div className="text-2xl font-black text-gray-900">대구은행 5081-3446-573</div>
                 <div className="text-base font-bold text-amber-800">예금주: 박문기(펫시터의정석)</div>
                 <div className="pt-6">
                   <input 
                    type="text" 
                    placeholder="입금자명 입력" 
                    className="w-full p-5 bg-white rounded-2xl font-black text-center shadow-sm border border-amber-100 outline-none"
                    value={formData.depositorName} 
                    onChange={e => setFormData(p => ({...p, depositorName: e.target.value}))} 
                   />
                   <p className="text-[10px] text-gray-400 mt-2 font-bold italic">* 입금 확인 후 전담 실장님이 예약을 최종 확정해 드립니다.</p>
                 </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep('INFO')} className="flex-1 py-6 rounded-2xl font-bold border-2 border-gray-100 text-gray-400">이전</button>
                <button onClick={handleBookingSubmit} className="flex-[2] bg-gray-900 text-white py-6 rounded-2xl font-black shadow-xl">예약 신청 완료</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculator;
