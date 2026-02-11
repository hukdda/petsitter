import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { validateBookingForm, formatPhone } from '../utils/validation';

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const today = new Date().toISOString().split('T')[0];
  
  const [formData, setFormData] = useState({
    serviceId: SERVICE_OPTIONS[0].id,
    startDate: today,
    endDate: today,
    visitsPerDay: 1,
    petCount: 1,
    visitTime: '10:00',
    userName: '',
    userPhone: '',
    addressDistrict: '',
    addressDetail: '',
    petName: '',
    petBreed: '',
    petAge: undefined as number | undefined,
    request: '',
    depositorName: ''
  });

  // 가격 계산
  const calculate = useCallback(async () => {
    const service = SERVICE_OPTIONS.find(s => s.id === formData.serviceId);
    if (!service) return;
    
    setLoading(true);
    try {
      const calculationData = {
        basePrice: service.basePrice * formData.visitsPerDay,
        startDate: formData.startDate,
        endDate: formData.endDate,
        petCount: formData.petCount,
        visitTime: formData.visitTime
      };
      
      const res = await api.calculatePrice(calculationData);
      setResult(res);
    } catch (e) {
      console.error('Price calculation error:', e);
      setResult({ 
        totalCost: service.basePrice * formData.visitsPerDay, 
        totalDays: 1, 
        surcharges: [] 
      });
    } finally {
      setLoading(false);
    }
  }, [formData]);

  useEffect(() => {
    if (step === 'ESTIMATE') calculate();
  }, [calculate, step]);

  // 예약 제출
  const handleBookingSubmit = async () => {
    // 검증
    const validation = validateBookingForm({
      ...formData,
      address: formData.addressDistrict, // 호환성
      paymentMethod: 'BANK'
    });
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      alert(Object.values(validation.errors)[0]);
      return;
    }
    
    setLoading(true);
    try {
      const bookingData = {
        ...formData,
        address: `${formData.addressDistrict} ${formData.addressDetail}`,
        serviceName: SERVICE_OPTIONS.find(s => s.id === formData.serviceId)?.name || '',
        totalCost: result?.totalCost || 0,
        platformFee: Math.round((result?.totalCost || 0) * PLATFORM_FEE_RATE),
        sitterAmount: Math.round((result?.totalCost || 0) * (1 - PLATFORM_FEE_RATE)),
        managedBy: '전담 실장님',
        paymentMethod: 'BANK' as const,
        status: 'WAITING_DEPOSIT' as const
      };
      
      await api.verifyPayment({
        merchant_uid: `PET_${Date.now()}`,
        amount: result?.totalCost || 0,
        paymentMethod: 'BANK',
        bookingData
      });
      
      setStep('SUCCESS');
    } catch (e) {
      console.error('Booking error:', e);
      alert('예약 접수 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 30분 단위 시간 옵션 생성
  const generateTimeOptions = () => {
    const options = [];
    for (let h = 7; h < 22; h++) {
      options.push(`${h.toString().padStart(2, '0')}:00`);
      options.push(`${h.toString().padStart(2, '0')}:30`);
    }
    return options;
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
          <button 
            onClick={() => window.location.href = '/'} 
            className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black shadow-xl"
          >
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
                {/* 서비스 선택 */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">서비스 선택</label>
                  <select 
                    value={formData.serviceId} 
                    onChange={e => setFormData(p => ({ ...p, serviceId: e.target.value }))}
                    className="w-full p-4 bg-gray-50 rounded-2xl font-black text-amber-900 outline-none border-2 border-transparent focus:border-amber-500 transition-colors"
                  >
                    {SERVICE_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name} - {opt.basePrice.toLocaleString()}원
                      </option>
                    ))}
                  </select>
                </div>

                {/* 하루 2회 방문 */}
                <div 
                  className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl cursor-pointer hover:bg-amber-100 transition-colors" 
                  onClick={() => setFormData(p => ({ ...p, visitsPerDay: p.visitsPerDay === 1 ? 2 : 1 }))}
                >
                  <input 
                    type="checkbox" 
                    checked={formData.visitsPerDay === 2} 
                    readOnly 
                    className="w-5 h-5 accent-amber-700" 
                  />
                  <div className="flex-1">
                    <span className="text-sm font-black text-gray-900">하루 2회 방문 (오전 + 저녁)</span>
                    <p className="text-xs text-gray-500 font-bold">기본 가격 × 2배</p>
                  </div>
                </div>

                {/* 날짜 선택 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">시작일</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      min={today}
                      onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))}
                      className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-amber-500 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">종료일</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      min={formData.startDate}
                      onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))}
                      className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                {/* 방문 시간 */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">방문 시간</label>
                  <select
                    value={formData.visitTime}
                    onChange={e => setFormData(p => ({ ...p, visitTime: e.target.value }))}
                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-amber-500 transition-colors"
                  >
                    {generateTimeOptions().map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 font-bold ml-1">
                    야간 시간대 (20시~08시) 선택 시 할증이 적용됩니다
                  </p>
                </div>

                {/* 반려동물 수 */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">반려동물 수</label>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, petCount: Math.max(1, p.petCount - 1) }))}
                      className="w-12 h-12 bg-white rounded-xl font-black text-xl text-gray-600 hover:bg-amber-100 hover:text-amber-700 transition-colors shadow-sm"
                    >
                      −
                    </button>
                    <div className="flex-1 text-center">
                      <span className="text-2xl font-black text-gray-900">{formData.petCount}</span>
                      <span className="text-sm font-bold text-gray-500 ml-2">마리</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(p => ({ ...p, petCount: Math.min(10, p.petCount + 1) }))}
                      className="w-12 h-12 bg-white rounded-xl font-black text-xl text-gray-600 hover:bg-amber-100 hover:text-amber-700 transition-colors shadow-sm"
                    >
                      +
                    </button>
                  </div>
                  {formData.petCount > 1 && (
                    <p className="text-xs text-amber-600 font-bold ml-1">
                      2마리 이상 시 추가 할증이 적용됩니다
                    </p>
                  )}
                </div>

                {/* 가격 표시 */}
                <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100 text-center">
                  <div className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">
                    Estimated Amount
                  </div>
                  <div className="text-4xl font-[950] text-gray-900 mb-2">
                    {(result?.totalCost || 0).toLocaleString()}원
                  </div>
                  <div className="text-sm font-bold text-gray-500 mb-4">
                    총 {result?.totalDays || 0}일 방문
                  </div>
                  {result && result.surcharges.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {result.surcharges.map((surcharge, idx) => (
                        <span key={idx} className="px-3 py-1 bg-white rounded-full text-xs font-bold text-amber-700 border border-amber-200">
                          {surcharge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setStep('INFO')} 
                  className="w-full bg-amber-700 text-white py-6 rounded-2xl font-black shadow-lg hover:bg-amber-800 transition-colors"
                >
                  정보 입력하기 →
                </button>
              </div>
            </div>
          )}

          {step === 'INFO' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-black tracking-tight">예약자 정보</h2>
              
              <div className="space-y-4">
                {/* 예약자 성함 */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">예약자 성함</label>
                  <input 
                    type="text" 
                    placeholder="홍길동" 
                    className={`w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none border-2 ${errors.userName ? 'border-red-500' : 'border-transparent focus:border-amber-500'} transition-colors`}
                    value={formData.userName} 
                    onChange={e => setFormData(p => ({ ...p, userName: e.target.value }))} 
                  />
                  {errors.userName && <p className="text-red-500 text-sm ml-1">{errors.userName}</p>}
                </div>

                {/* 연락처 */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">연락처</label>
                  <input 
                    type="tel" 
                    placeholder="010-0000-0000" 
                    className={`w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none border-2 ${errors.userPhone ? 'border-red-500' : 'border-transparent focus:border-amber-500'} transition-colors`}
                    value={formData.userPhone} 
                    onChange={e => setFormData(p => ({ ...p, userPhone: formatPhone(e.target.value) }))} 
                  />
                  {errors.userPhone && <p className="text-red-500 text-sm ml-1">{errors.userPhone}</p>}
                </div>

                {/* 방문 주소 */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">방문 지역 (구/군)</label>
                  <input 
                    type="text" 
                    placeholder="예: 서울시 강남구" 
                    className={`w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none border-2 ${errors.address ? 'border-red-500' : 'border-transparent focus:border-amber-500'} transition-colors`}
                    value={formData.addressDistrict} 
                    onChange={e => setFormData(p => ({ ...p, addressDistrict: e.target.value }))} 
                  />
                </div>

                {/* 상세 주소 */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">상세 주소</label>
                  <input 
                    type="text" 
                    placeholder="아파트명, 동/호수 등" 
                    className={`w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none border-2 ${errors.address ? 'border-red-500' : 'border-transparent focus:border-amber-500'} transition-colors`}
                    value={formData.addressDetail} 
                    onChange={e => setFormData(p => ({ ...p, addressDetail: e.target.value }))} 
                  />
                  {errors.address && <p className="text-red-500 text-sm ml-1">{errors.address}</p>}
                </div>

                {/* 반려동물 정보 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">펫 이름</label>
                    <input 
                      type="text" 
                      placeholder="뽀삐" 
                      className={`w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none border-2 ${errors.pet ? 'border-red-500' : 'border-transparent focus:border-amber-500'} transition-colors`}
                      value={formData.petName} 
                      onChange={e => setFormData(p => ({ ...p, petName: e.target.value }))} 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">품종</label>
                    <input 
                      type="text" 
                      placeholder="말티즈" 
                      className={`w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none border-2 ${errors.pet ? 'border-red-500' : 'border-transparent focus:border-amber-500'} transition-colors`}
                      value={formData.petBreed} 
                      onChange={e => setFormData(p => ({ ...p, petBreed: e.target.value }))} 
                    />
                  </div>
                </div>

                {/* 반려동물 나이 */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">나이 (선택)</label>
                  <input 
                    type="number" 
                    placeholder="3" 
                    min="0"
                    max="30"
                    className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-amber-500 transition-colors"
                    value={formData.petAge || ''} 
                    onChange={e => setFormData(p => ({ ...p, petAge: e.target.value ? parseInt(e.target.value) : undefined }))} 
                  />
                </div>
                {errors.pet && <p className="text-red-500 text-sm ml-1">{errors.pet}</p>}

                {/* 요청사항 */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">요청사항 (선택)</label>
                  <textarea 
                    placeholder="특이사항이나 요청사항을 자유롭게 작성해주세요" 
                    rows={4}
                    maxLength={500}
                    className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-amber-500 transition-colors resize-none"
                    value={formData.request} 
                    onChange={e => setFormData(p => ({ ...p, request: e.target.value }))} 
                  />
                  <p className="text-xs text-gray-400 font-bold ml-1">{formData.request.length}/500</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setStep('ESTIMATE')} 
                  className="flex-1 py-6 rounded-2xl font-bold border-2 border-gray-100 text-gray-400 hover:border-gray-300 transition-colors"
                >
                  이전
                </button>
                <button 
                  onClick={() => setStep('PAYMENT')} 
                  className="flex-[2] bg-amber-700 text-white py-6 rounded-2xl font-black shadow-lg hover:bg-amber-800 transition-colors"
                >
                  입금 계좌 확인 →
                </button>
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
                <input 
                  type="text" 
                  placeholder="입금자명 입력" 
                  className={`w-full p-5 bg-white rounded-2xl font-black text-center shadow-sm border-2 ${errors.depositorName ? 'border-red-500' : 'border-amber-100'} outline-none focus:border-amber-500 transition-colors`}
                  value={formData.depositorName} 
                  onChange={e => setFormData(p => ({ ...p, depositorName: e.target.value }))} 
                />
                {errors.depositorName && <p className="text-red-500 text-sm">{errors.depositorName}</p>}
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setStep('INFO')} 
                  className="flex-1 py-6 rounded-2xl font-bold border-2 border-gray-100 text-gray-400 hover:border-gray-300 transition-colors"
                >
                  이전
                </button>
                <button 
                  onClick={handleBookingSubmit} 
                  disabled={loading}
                  className="flex-[2] bg-gray-900 text-white py-6 rounded-2xl font-black shadow-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '처리 중...' : `${(result?.totalCost || 0).toLocaleString()}원 예약 접수`}
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