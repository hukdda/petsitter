import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const SERVICE_OPTIONS = [
  { id: 'visit-30', name: '방문 돌봄 30분', basePrice: 18000 },
  { id: 'visit-60', name: '방문 돌봄 60분', basePrice: 25000 },
  { id: 'visit-90', name: '방문 돌봄 90분', basePrice: 33000 },
  { id: 'visit-120', name: '방문 돌봄 120분', basePrice: 40000 },
  { id: 'dog-bath', name: '강아지 목욕', basePrice: 50000 }
];

const PLATFORM_FEE_RATE = 0.30;

type Step = 'ESTIMATE' | 'INFO' | 'PAYMENT' | 'SUCCESS';

interface PriceCalculationResult {
  totalCost: number;
  totalDays: number;
  surcharges: string[];
  orderId?: string;
}

const Calculator: React.FC = () => {
  const [step, setStep] = useState<Step>('ESTIMATE');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PriceCalculationResult | null>(null);
  const [useCustomDates, setUseCustomDates] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: SERVICE_OPTIONS[0].id,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    selectedDates: [] as string[],
    visitsPerDay: 1,
    petCount: 1,
    visitTime: '',
    userName: '',
    userPhone: '',
    address: '',
    petName: '',
    petBreed: '',
    request: '',
    depositorName: ''
  });

  const getDateRange = () => {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const dates: Date[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  };

  const toggleDate = (dateStr: string) => {
    setFormData(prev => {
      const newDates = prev.selectedDates.includes(dateStr)
        ? prev.selectedDates.filter(d => d !== dateStr)
        : [...prev.selectedDates, dateStr].sort();
      return { ...prev, selectedDates: newDates };
    });
  };

  const calculate = useCallback(async () => {
    const service = SERVICE_OPTIONS.find(s => s.id === formData.serviceId);
    if (!service) return;
    
    setLoading(true);
    try {
      const calculationData = {
        basePrice: service.basePrice * formData.visitsPerDay,
        startDate: useCustomDates ? formData.selectedDates[0] : formData.startDate,
        endDate: useCustomDates ? formData.selectedDates[formData.selectedDates.length - 1] : formData.endDate,
        petCount: formData.petCount,
        visitTime: formData.visitTime
      };
      
      const res = await api.calculatePrice(calculationData);
      
      if (formData.visitsPerDay === 2) {
        res.totalCost = res.totalCost * 2;
        res.surcharges.push('하루 2회 방문');
      }
      
      if (useCustomDates && formData.selectedDates.length > 0) {
        const actualDays = formData.selectedDates.length;
        const dailyRate = res.totalCost / res.totalDays;
        res.totalCost = Math.round(dailyRate * actualDays);
        res.totalDays = actualDays;
      }
      
      setResult(res);
    } catch (e) {
      setResult({ 
        totalCost: service.basePrice * formData.visitsPerDay, 
        totalDays: 1, 
        surcharges: [] 
      });
    } finally {
      setLoading(false);
    }
  }, [formData, useCustomDates]);

  useEffect(() => {
    if (step === 'ESTIMATE') calculate();
  }, [calculate, step]);

  const handleBookingSubmit = async () => {
    if (!formData.userName || !formData.userPhone || !formData.address || !formData.depositorName) {
      return alert('필수 정보를 모두 입력해 주세요');
    }
    
    setLoading(true);
    try {
      const bookingData = {
        ...formData,
        serviceName: SERVICE_OPTIONS.find(s => s.id === formData.serviceId)?.name || '',
        totalCost: result?.totalCost || 0,
        platformFee: Math.round((result?.totalCost || 0) * PLATFORM_FEE_RATE)
      };
      
      await api.verifyPayment({
        merchant_uid: `PET_${Date.now()}`,
        amount: result?.totalCost || 0,
        paymentMethod: 'BANK',
        bookingData
      });
      setStep('SUCCESS');
    } catch (e) {
      alert('예약 접수 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'SUCCESS') {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl border border-amber-100">
          <div className="text-7xl mb-8">✅</div>
          <h2 className="text-3xl font-black mb-4">예약 접수 완료!</h2>
          <p className="text-gray-500 font-bold mb-10 text-sm leading-relaxed">
            입금자명 <span className="text-amber-700 font-black">[{formData.depositorName}]</span>으로 확인 부탁드립니다<br />
            담당자가 확인 즉시 안내 문자를 발송해드립니다.
          </p>
          <button onClick={() => window.location.href = '/'} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black shadow-xl">
            홈으로 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pt-8 pb-32 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 relative overflow-hidden border border-gray-100">
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {step === 'ESTIMATE' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black tracking-tight">돌봄 비용 확인</h2>
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">서비스 선택</label>
                  <select 
                    value={formData.serviceId} 
                    onChange={e => setFormData(p => ({ ...p, serviceId: e.target.value }))}
                    className="w-full p-4 bg-gray-50 rounded-2xl font-black text-amber-900 outline-none"
                  >
                    {SERVICE_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl cursor-pointer" onClick={() => setFormData(p => ({ ...p, visitsPerDay: p.visitsPerDay === 1 ? 2 : 1 }))}>
                  <input type="checkbox" checked={formData.visitsPerDay === 2} readOnly className="w-5 h-5 accent-amber-700" />
                  <div className="flex-1">
                    <span className="text-sm font-black text-gray-900">하루 2회 방문 (오전 + 저녁)</span>
                    <p className="text-xs text-gray-500 font-bold">기본 가격 × 2배</p>
                  </div>
                </div>

                <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100 text-center">
                  <div className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Estimated Amount</div>
                  <div className="text-4xl font-[950] text-gray-900">{(result?.totalCost || 0).toLocaleString()}원</div>
                  <div className="text-sm font-bold text-gray-500 mt-2">입금 후 예약 접수 상태가 됩니다</div>
                </div>

                <button onClick={() => setStep('INFO')} className="w-full bg-amber-700 text-white py-6 rounded-2xl font-black shadow-lg">
                  정보 입력하기 →
                </button>
              </div>
            </div>
          )}

          {step === 'INFO' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black tracking-tight">예약자 정보</h2>
              <div className="space-y-4">
                <input type="text" placeholder="예약자 성함" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.userName} onChange={e => setFormData(p => ({ ...p, userName: e.target.value }))} />
                <input type="tel" placeholder="연락처 (010-0000-0000)" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.userPhone} onChange={e => setFormData(p => ({ ...p, userPhone: e.target.value }))} />
                <input type="text" placeholder="방문 주소" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} />
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="펫 이름" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.petName} onChange={e => setFormData(p => ({ ...p, petName: e.target.value }))} />
                  <input type="text" placeholder="견종/묘종" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" value={formData.petBreed} onChange={e => setFormData(p => ({ ...p, petBreed: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep('ESTIMATE')} className="flex-1 py-6 rounded-2xl font-bold border-2 border-gray-100 text-gray-400">이전</button>
                <button onClick={() => setStep('PAYMENT')} className="flex-[2] bg-amber-700 text-white py-6 rounded-2xl font-black shadow-lg">입금 계좌 확인 →</button>
              </div>
            </div>
          )}

          {step === 'PAYMENT' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black tracking-tight text-center">무통장 입금 안내</h2>
              <div className="bg-amber-50/50 p-10 rounded-[3rem] border border-amber-100 text-center space-y-4">
                <div className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Bank Info</div>
                <div className="text-2xl font-black text-gray-900">대구은행 5081-3446-573</div>
                <div className="text-base font-bold text-amber-800">예금주: 박문기 (펫시터의정석)</div>
                <input type="text" placeholder="입금자명 입력" className="w-full p-5 bg-white rounded-2xl font-black text-center shadow-sm border border-amber-100 outline-none" value={formData.depositorName} onChange={e => setFormData(p => ({ ...p, depositorName: e.target.value }))} />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep('INFO')} className="flex-1 py-6 rounded-2xl font-bold border-2 border-gray-100 text-gray-400">이전</button>
                <button onClick={handleBookingSubmit} className="flex-[2] bg-gray-900 text-white py-6 rounded-2xl font-black shadow-xl">{(result?.totalCost || 0).toLocaleString()}원 예약 접수</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calculator;