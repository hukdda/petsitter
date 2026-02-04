
import React, { useState } from 'react';
import { api } from '../services/api.ts';

const Apply: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    petExperience: '',
    motivation: '',
    agreedToTerms: false
  });

  const handleInputChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.address) return alert('필수 정보를 모두 입력해 주세요.');
    if (!form.agreedToTerms) return alert('필수 동의 사항에 체크해 주세요.');
    
    setSubmitting(true);
    try {
      await api.submitApplication(form);
      setSubmitted(true);
    } catch (err) {
      alert('지원서 제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="py-24 min-h-screen flex items-center justify-center px-6 text-center bg-[#fafafa]">
        <div className="max-w-md w-full bg-white p-12 rounded-[3.5rem] shadow-2xl border border-amber-100">
          <div className="text-7xl mb-8">💌</div>
          <h2 className="text-3xl font-black mb-4">지원서 제출 완료!</h2>
          <p className="text-gray-500 font-bold mb-10 text-sm leading-relaxed">
            대표님이 검토 후 3일 이내에<br />
            개별적으로 인터뷰 연락을 드립니다.<br />
            잠시만 기다려 주세요!
          </p>
          <button onClick={() => window.location.href = '/'} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black shadow-xl">홈으로 이동</button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-[#fafafa] min-h-screen">
      <div className="max-w-xl mx-auto px-4">
        <h1 className="text-3xl font-[950] text-center mb-10 tracking-tight text-gray-900 uppercase tracking-tighter">펫시터 지원하기</h1>
        
        <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 p-8 md:p-12 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase ml-1">성함</label>
              <input type="text" placeholder="성함을 입력하세요" className="w-full p-5 bg-gray-50 rounded-2xl font-black outline-none" value={form.name} onChange={e => handleInputChange('name', e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase ml-1">연락처</label>
              <input type="tel" placeholder="010-0000-0000" className="w-full p-5 bg-gray-50 rounded-2xl font-black outline-none" value={form.phone} onChange={e => handleInputChange('phone', e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase ml-1">거주 지역</label>
              <input type="text" placeholder="예) 서울 강남구 삼성동" className="w-full p-5 bg-gray-50 rounded-2xl font-black outline-none" value={form.address} onChange={e => handleInputChange('address', e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-400 tracking-widest uppercase ml-1">반려동물 경험</label>
              <textarea placeholder="경험을 짧게 적어주세요." className="w-full h-32 p-5 bg-gray-50 rounded-2xl font-bold outline-none resize-none" value={form.petExperience} onChange={e => handleInputChange('petExperience', e.target.value)} />
            </div>
          </div>
          
          <label className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl font-black cursor-pointer">
            <input type="checkbox" checked={form.agreedToTerms} onChange={e => handleInputChange('agreedToTerms', e.target.checked)} className="w-5 h-5 accent-amber-700" />
            <span className="text-xs">인터뷰 및 교육 참여에 동의합니다.</span>
          </label>

          <button 
            onClick={handleSubmit} 
            disabled={submitting} 
            className="w-full bg-amber-700 text-white py-6 rounded-2xl font-black shadow-lg transition-all active:scale-95"
          >
            {submitting ? '제출 중...' : '지원서 최종 제출하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Apply;
