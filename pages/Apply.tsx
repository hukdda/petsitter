
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.ts';

declare global {
  interface Window {
    Kakao: any;
    daum: any;
  }
}

const Apply: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detailInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    birthDate: '',
    isSmoker: false,
    address: '',
    addressDetail: '',
    currentJob: '주부',
    currentJobDirect: '',
    canDeclareIncome: true,
    activeDaysPerMonth: '평균 20일 이상 가능합니다.',
    availableDays: [] as string[],
    availableTimes: [] as string[],
    availableTimesDirect: '',
    activityRegion: '',
    transportation: '대중교통',
    catExperience: '반려 경험 없음',
    dogExperience: '반려 경험 없음',
    otherPetExp: '',
    industryExp: '',
    sitterHistory: '활동 해본 적 없음',
    motivation: '',
    discoveryPath: '포탈 검색',
    discoveryPathDirect: '',
    agreedToProgram: false,
    agreedToFee: false,
    noCriminalRecord: false,
    smokingPledge: false,
    safetyPledge: false,
    signature: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('verifiedUser');
    if (saved) {
      try {
        const { name, phone, verified, timestamp } = JSON.parse(saved);
        const isExpired = Date.now() - timestamp > 3600000;
        if (verified && !isExpired) {
          setForm(prev => ({ ...prev, name: name || '', phone: phone || '' }));
          setIsVerified(true);
        } else {
          localStorage.removeItem('verifiedUser');
        }
      } catch (e) {
        localStorage.removeItem('verifiedUser');
      }
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    if (code && !isVerified) {
      const handleKakaoCallback = async () => {
        setSubmitting(true);
        try {
          const redirectUri = `${window.location.origin}/apply`;
          const response = await fetch('/api/kakao-auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, redirectUri })
          });
          const data = await response.json();
          if (data.success) {
            setForm(prev => ({ 
              ...prev, 
              name: data.user.name || prev.name, 
              phone: data.user.phone || prev.phone 
            }));
            setIsVerified(true);
            localStorage.setItem('verifiedUser', JSON.stringify({ ...data.user, verified: true, timestamp: Date.now() }));
            navigate('/apply', { replace: true });
          } else {
            throw new Error(data.message);
          }
        } catch (err: any) {
          console.error('Apply Auth Error:', err);
          alert(`인증 중 오류가 발생했습니다: ${err.message}`);
        } finally {
          setSubmitting(false);
        }
      };
      handleKakaoCallback();
    }
  }, [location, navigate, isVerified]);

  const steps = [
    { title: '가입/인증', icon: '👤' },
    { title: '활동 정보', icon: '📅' },
    { title: '경력 사항', icon: '🎖️' },
    { title: '기타 정보', icon: '🔍' },
    { title: '동의/서약', icon: '✍️' },
    { title: '최종 안내', icon: '✅' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!form.name) return alert('성함을 입력해 주세요.');
      if (!form.phone || form.phone.length < 10) return alert('연락처를 정확히 입력해 주세요.');
      if (!form.birthDate || form.birthDate.length < 8) return alert('주민번호 앞 7자리를 정확히 입력해 주세요 (예: 900101-2)');
      if (!form.address) return alert('거주지 주소를 입력해 주세요.');
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    window.scrollTo(0, 0);
  };

  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: (data: any) => {
        setForm(prev => ({ ...prev, address: `${data.sido} ${data.sigungu}` }));
        setTimeout(() => detailInputRef.current?.focus(), 300);
      }
    }).open();
  };

  const startKakaoAuth = () => {
    const KAKAO_CLIENT_ID = "4e82f00882c1c24d0b83c1e001adce2f";
    const redirectUri = `${window.location.origin}/apply`;
    window.location.href = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  const handleSubmit = async () => {
    if (!form.agreedToProgram || !form.agreedToFee || !form.safetyPledge) {
      return alert('모든 동의 사항에 체크해 주세요.');
    }
    setSubmitting(true);
    try {
      const signature = canvasRef.current?.toDataURL() || '';
      await api.submitApplication({ ...form, signature });
      localStorage.removeItem('verifiedUser');
      setSubmitted(true);
    } catch (err) {
      alert('제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const startSigning = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = e.touches ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;
    ctx.moveTo(x, y);
  };
  const draw = (e: any) => {
    const canvas = canvasRef.current; if (!canvas || (!e.touches && e.buttons === 0)) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.touches ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = e.touches ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;
    ctx.lineTo(x, y); ctx.stroke();
  };

  if (submitted) {
    return (
      <div className="py-24 bg-[#fdfaf5] min-h-screen flex items-center justify-center px-6 text-center">
        <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl border border-amber-100">
          <div className="text-7xl mb-8">💌</div>
          <h2 className="text-3xl font-black mb-4">지원서 접수 완료!</h2>
          <p className="text-gray-500 font-bold mb-10 leading-relaxed text-sm">
            대표님이 직접 모든 지원서를 검토합니다.<br />
            영업일 기준 5일 이내에 개별적으로<br />
            인터뷰 안내 연락을 드리겠습니다.
          </p>
          <button onClick={() => window.location.href = '/'} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black shadow-xl hover:scale-105 transition-all">홈으로 가기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 md:py-16 bg-[#fafafa] min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        
        <div className="mb-12 flex justify-between px-4 relative">
          <div className="absolute top-5 left-10 right-10 h-0.5 bg-gray-100 -z-10"></div>
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all ${i <= currentStep ? 'bg-amber-700 text-white shadow-lg' : 'bg-white text-gray-200 border border-gray-100'}`}>
                {i < currentStep ? '✓' : s.icon}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-tighter ${i <= currentStep ? 'text-amber-900' : 'text-gray-300'}`}>{s.title}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 p-6 md:p-12 overflow-hidden">
          
          {currentStep === 0 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-black text-gray-900">전문가 회원가입 및 본인 확인</h3>
                <p className="text-xs font-bold text-gray-400">카카오 싱크를 통한 통합 회원가입 절차입니다.</p>
              </div>

              <div className="space-y-6">
                {!isVerified && (
                  <button onClick={startKakaoAuth} className="w-full bg-[#FEE500] py-6 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all text-[#191919] mb-4">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.48 2 10.791c0 2.758 1.83 5.161 4.587 6.556l-1.159 4.255c-.07.258.21.464.415.303l5.013-3.292c.376.041.76.069 1.144.069 5.523 0 10-3.48 10-7.791S17.523 3 12 3z"/></svg>
                    카카오로 정보 자동 채우기
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-gray-50 rounded-2xl group border-2 border-transparent focus-within:border-amber-700 transition-all shadow-sm">
                    <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">NAME</label>
                    <input 
                      type="text" 
                      value={form.name} 
                      onChange={e => handleInputChange('name', e.target.value)}
                      placeholder="성함을 입력하세요"
                      className="w-full bg-transparent font-black text-gray-900 outline-none placeholder:text-gray-300 text-lg"
                    />
                  </div>
                  <div className="p-5 bg-gray-50 rounded-2xl group border-2 border-transparent focus-within:border-amber-700 transition-all shadow-sm">
                    <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">PHONE</label>
                    <input 
                      type="tel" 
                      value={form.phone} 
                      onChange={e => handleInputChange('phone', e.target.value)}
                      placeholder="010-0000-0000"
                      className="w-full bg-transparent font-black text-gray-900 outline-none placeholder:text-gray-300 text-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 mb-2 ml-1">주민등록번호 앞 7자리</label>
                  <input type="text" value={form.birthDate} onChange={e => handleInputChange('birthDate', e.target.value)} maxLength={8} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold placeholder:text-gray-300 shadow-inner" placeholder="예) 950101-2" />
                  <p className="text-[10px] text-amber-700 font-bold mt-2 ml-1">※ 만 19세 이상의 성인만 펫시터 지원이 가능합니다.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-2 ml-1">흡연 여부</label>
                    <div className="flex bg-gray-50 p-1.5 rounded-2xl">
                      <button onClick={() => handleInputChange('isSmoker', true)} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${form.isSmoker ? 'bg-white shadow-md text-amber-900' : 'text-gray-400'}`}>흡연</button>
                      <button onClick={() => handleInputChange('isSmoker', false)} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${!form.isSmoker ? 'bg-white shadow-md text-amber-900' : 'text-gray-400'}`}>비흡연</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-2 ml-1">소득 신고 가능 여부 (3.3%)</label>
                    <div className="flex bg-gray-50 p-1.5 rounded-2xl">
                      <button onClick={() => handleInputChange('canDeclareIncome', true)} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${form.canDeclareIncome ? 'bg-white shadow-md text-amber-900' : 'text-gray-400'}`}>가능</button>
                      <button onClick={() => handleInputChange('canDeclareIncome', false)} className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${!form.canDeclareIncome ? 'bg-white shadow-md text-amber-900' : 'text-gray-400'}`}>불가능</button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-black text-gray-500 mb-1 ml-1">거주지 주소</label>
                  <div onClick={handleAddressSearch} className="p-4 bg-gray-50 rounded-2xl font-bold text-gray-500 cursor-pointer border-2 border-transparent hover:border-amber-200 transition-all">{form.address || "시/도, 시/군/구 선택"}</div>
                  <input ref={detailInputRef} type="text" value={form.addressDetail} onChange={e => handleInputChange('addressDetail', e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-amber-700 shadow-inner" placeholder="상세 주소 (선택)" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-2xl font-black text-gray-900">2. 활동 정보</h3>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-3 ml-1">한 달 기준 활동 가능한 일수</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      '평균 20일 이상 가능합니다.',
                      '10일 ~ 20일 가능합니다.',
                      '평균 10일 이하 가능합니다.',
                      '주말만 가능합니다.'
                    ].map(opt => (
                      <button key={opt} onClick={() => handleInputChange('activeDaysPerMonth', opt)} className={`p-4 rounded-2xl text-left border-2 font-black text-sm transition-all ${form.activeDaysPerMonth === opt ? 'border-amber-700 bg-amber-50 text-amber-900' : 'border-gray-50 text-gray-400'}`}>{opt}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 mb-3 ml-1">활동 가능한 요일 (중복 선택)</label>
                  <div className="flex flex-wrap gap-2">
                    {['월', '화', '수', '목', '금', '토', '일'].map(day => (
                      <button key={day} onClick={() => {
                        const next = form.availableDays.includes(day) ? form.availableDays.filter(d => d !== day) : [...form.availableDays, day];
                        handleInputChange('availableDays', next);
                      }} className={`w-14 h-14 rounded-2xl font-black border-2 transition-all ${form.availableDays.includes(day) ? 'bg-amber-700 text-white border-amber-700 shadow-md' : 'bg-white text-gray-300 border-gray-100'}`}>{day}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-500 mb-3 ml-1">활동 가능한 시간대 (중복 선택)</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      '모두 가능합니다.',
                      '오전 타임 (08:00 - 12:00)',
                      '오후 타임 (12:00 - 18:00)',
                      '저녁 타임 (18:00 - 22:00)',
                      '직접 입력'
                    ].map(t => (
                      <button key={t} onClick={() => {
                        const next = form.availableTimes.includes(t) ? form.availableTimes.filter(item => item !== t) : [...form.availableTimes, t];
                        handleInputChange('availableTimes', next);
                      }} className={`p-4 rounded-2xl text-left border-2 font-black text-[11px] transition-all ${form.availableTimes.includes(t) ? 'bg-amber-50 border-amber-700 text-amber-900 shadow-sm' : 'bg-white text-gray-300 border-gray-100'}`}>{t}</button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-2 ml-1">활동 가능 지역 (구/동 단위)</label>
                    <input type="text" value={form.activityRegion} onChange={e => handleInputChange('activityRegion', e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-bold shadow-inner" placeholder="예) 서울 강남구, 서초구 전역" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-2 ml-1">주요 이동 수단</label>
                    <input type="text" value={form.transportation} onChange={e => handleInputChange('transportation', e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-bold shadow-inner" placeholder="예) 대중교통, 자차 등" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-2xl font-black text-gray-900">3. 반려 경험 및 경력</h3>
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-3 ml-1">🐱 고양이 반려 경험</label>
                    <select value={form.catExperience} onChange={e => handleInputChange('catExperience', e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-black text-sm outline-none">
                      {['현재 반려중', '과거에 반려함', '반려 경험 없음'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-3 ml-1">🐶 강아지 반려 경험</label>
                    <select value={form.dogExperience} onChange={e => handleInputChange('dogExperience', e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl font-black text-sm outline-none">
                      {['현재 반려중', '과거에 반려함', '반려 경험 없음'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-3 ml-1">타인의 반려동물 돌봄 경험</label>
                  <textarea value={form.otherPetExp} onChange={e => handleInputChange('otherPetExp', e.target.value)} className="w-full h-32 p-4 bg-gray-50 rounded-2xl font-bold text-sm resize-none shadow-inner" placeholder="지인 돌봄, 임시 보호 등 본인의 돌봄 경험에 대해 구체적으로 적어주세요." />
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-2xl font-black text-gray-900">4. 기타 정보</h3>
              <div className="space-y-8">
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-3 ml-1">지원 동기</label>
                  <textarea value={form.motivation} onChange={e => handleInputChange('motivation', e.target.value)} className="w-full h-40 p-5 bg-gray-50 rounded-[2rem] font-bold text-sm resize-none border-2 border-transparent focus:border-amber-700 outline-none shadow-inner" placeholder="펫시터의 정석에서 함께하고 싶은 이유를 적어주세요." />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-2xl font-black text-gray-900">5. 최종 동의 및 서명</h3>
              <div className="space-y-4">
                {[
                  { id: 'agreedToProgram', text: '펫시터 교육 프로그램 참석에 동의하며 평일(월, 화) 참석이 가능합니다.' },
                  { id: 'agreedToFee', text: '프로그램 참석비(최대 6만원) 발생에 동의합니다. (20건 예약 시 100% 환급)' },
                  { id: 'smokingPledge', text: '활동 중 절대 금연을 준수할 것에 동의하며 위반 시 자격 취소를 수용합니다.' },
                  { id: 'noCriminalRecord', text: '성범죄 및 아동학대 등 범죄 결격 사유가 없음을 확약합니다.' },
                  { id: 'safetyPledge', text: '지원서에 기재된 내용은 모두 본인이 직접 작성한 사실임을 확인합니다.' }
                ].map(item => (
                  <label key={item.id} className="flex items-start gap-4 p-5 bg-gray-50 rounded-2xl font-black cursor-pointer border-2 border-transparent hover:border-amber-200 transition-all">
                    <input type="checkbox" checked={(form as any)[item.id]} onChange={e => handleInputChange(item.id, e.target.checked)} className="w-5 h-5 mt-0.5 accent-amber-700" />
                    <span className="text-[11px] leading-relaxed text-gray-700">{item.text}</span>
                  </label>
                ))}
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase tracking-widest">Electronic Signature</label>
                  <button onClick={() => canvasRef.current?.getContext('2d')?.clearRect(0,0,800,200)} className="text-[10px] font-black text-amber-700 underline">서명 지우기</button>
                </div>
                <canvas ref={canvasRef} width={800} height={200} onMouseDown={startSigning} onMouseMove={draw} onTouchStart={startSigning} onTouchMove={draw} className="w-full h-40 bg-gray-50 border-2 border-dashed border-gray-100 rounded-[2.5rem] cursor-crosshair shadow-inner" />
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
              <h3 className="text-2xl font-black text-gray-900">6. 등록 절차 안내</h3>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { step: '1', title: '서류 심사', desc: '5일 이내에 인터뷰 대상자에게 개별 연락 드립니다.' },
                  { step: '2', title: '비대면 인터뷰', desc: 'ZOOM을 통해 약 10분간 심층 인터뷰가 진행됩니다.' },
                  { step: '3', title: '역량 강화 프로그램', desc: '온/오프라인 교육을 통해 전문가 자격을 갖춥니다.' },
                  { step: '4', title: '최종 등록 및 활동', desc: '테스트 통과 후 공식 시터로 활동을 시작합니다.' }
                ].map(item => (
                  <div key={item.step} className="flex gap-5 p-6 bg-amber-50/50 rounded-3xl border border-amber-100">
                    <div className="w-8 h-8 rounded-full bg-amber-700 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">{item.step}</div>
                    <div>
                      <h4 className="font-black text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-xs font-bold text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleSubmit} disabled={submitting} className="w-full bg-gray-900 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-2xl hover:bg-black transition-all active:scale-95 flex justify-center items-center">
                {submitting ? <div className="spinner border-white/30 border-t-white"></div> : '전문가 지원서 최종 제출하기'}
              </button>
            </div>
          )}

          <div className="mt-12 flex gap-3">
            {currentStep > 0 && (
              <button onClick={() => setCurrentStep(prev => prev - 1)} className="flex-1 py-5 rounded-2xl font-bold border-2 border-gray-100 text-gray-400 hover:bg-gray-50 transition-all">이전</button>
            )}
            {currentStep < steps.length - 1 && (
              <button onClick={handleNext} className="flex-[2] py-5 bg-amber-700 text-white rounded-2xl font-black shadow-lg hover:bg-amber-800 transition-all">
                {currentStep === 0 ? '다음 단계로 이동 →' : '다음 단계로 이동 →'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Apply;
