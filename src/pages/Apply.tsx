import React, { useState } from 'react';
import { api } from '../services/api';
import { ApplicationData } from '../types';

const Apply: React.FC = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<Partial<ApplicationData>>({
    name: '',
    phone: '',
    birthDate: '',
    gender: '',
    isSmoker: false,
    address: '',
    addressDetail: '',
    residenceType: '',
    hasPet: '',
    currentJob: '',
    currentJobDirect: '',
    canDeclareIncome: false,
    activeDaysPerMonth: '',
    availableDays: [],
    availableTimes: [],
    availableTimesDirect: '',
    activityRegion: '',
    transportation: '',
    catExperience: '',
    dogExperience: '',
    otherPetExp: '',
    industryExp: '',
    sitterHistory: '',
    motivation: '',
    discoveryPath: '',
    discoveryPathDirect: '',
    agreedToProgram: false,
    agreedToFee: false,
    noCriminalRecord: false,
    smokingPledge: false,
    safetyPledge: false,
    signature: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: 'availableDays' | 'availableTimes', value: string) => {
    setForm(prev => {
      const currentArray = prev[field] as string[] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const handleSubmit = async () => {
    // 필수 필드 검증
    if (!form.name || !form.phone || !form.birthDate || !form.gender) {
      return alert('기본 정보를 모두 입력해 주세요.');
    }
    if (!form.address || !form.residenceType) {
      return alert('거주 정보를 입력해 주세요.');
    }
    if (!form.currentJob || !form.activeDaysPerMonth) {
      return alert('직업 및 활동 정보를 입력해 주세요.');
    }
    if (form.availableDays?.length === 0 || form.availableTimes?.length === 0) {
      return alert('활동 가능 요일과 시간을 선택해 주세요.');
    }
    if (!form.activityRegion || !form.transportation) {
      return alert('활동 지역과 이동 수단을 입력해 주세요.');
    }
    if (!form.catExperience || !form.dogExperience) {
      return alert('반려동물 경험을 입력해 주세요.');
    }
    if (!form.motivation) {
      return alert('지원 동기를 입력해 주세요.');
    }
    if (!form.agreedToProgram || !form.agreedToFee || !form.noCriminalRecord || !form.smokingPledge || !form.safetyPledge) {
      return alert('모든 동의 사항에 체크해 주세요.');
    }
    if (!form.signature) {
      return alert('전자 서명을 입력해 주세요.');
    }

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
            제출하신 지원서를 꼼꼼히 검토하여<br />
            3일 이내에 개별적으로 연락드리겠습니다.<br />
            잠시만 기다려 주세요!
          </p>
          <button onClick={() => window.location.href = '/'} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black shadow-xl">
            홈으로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-[#fafafa] min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-[950] text-center mb-4 tracking-tight text-gray-900">펫시터 지원하기</h1>
        <p className="text-center text-sm text-gray-500 font-bold mb-10">
          모든 항목을 정확하게 작성해 주세요. (약 5~10분 소요)
        </p>

        <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 p-8 md:p-12 space-y-10">
          
          {/* 1. 기본 정보 */}
          <section>
            <h2 className="text-xl font-black mb-6 text-gray-900 border-b-2 border-amber-700 pb-3">📋 기본 정보</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400">성명 *</label>
                  <input type="text" placeholder="홍길동" className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none"
                    value={form.name} onChange={e => handleInputChange('name', e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400">연락처 *</label>
                  <input type="tel" placeholder="010-0000-0000" className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none"
                    value={form.phone} onChange={e => handleInputChange('phone', e.target.value)} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400">생년월일 *</label>
                  <input type="date" className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none"
                    value={form.birthDate} onChange={e => handleInputChange('birthDate', e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400">성별 *</label>
                  <select className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none"
                    value={form.gender} onChange={e => handleInputChange('gender', e.target.value)}>
                    <option value="">선택하세요</option>
                    <option value="남성">남성</option>
                    <option value="여성">여성</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <input type="checkbox" checked={form.isSmoker} onChange={e => handleInputChange('isSmoker', e.target.checked)}
                  className="w-5 h-5 accent-amber-700" />
                <label className="text-sm font-bold text-gray-700">흡연자입니다</label>
              </div>
            </div>
          </section>

          {/* 2. 거주 정보 */}
          <section>
            <h2 className="text-xl font-black mb-6 text-gray-900 border-b-2 border-amber-700 pb-3">🏠 거주 정보</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400">주소 *</label>
                <input type="text" placeholder="서울특별시 강남구 테헤란로" className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none"
                  value={form.address} onChange={e => handleInputChange('address', e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400">상세 주소</label>
                <input type="text" placeholder="아파트 동/호수 등" className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none"
                  value={form.addressDetail} onChange={e => handleInputChange('addressDetail', e.target.value)} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400">거주 형태 *</label>
                  <select className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none"
                    value={form.residenceType} onChange={e => handleInputChange('residenceType', e.target.value)}>
                    <option value="">선택하세요</option>
                    <option value="아파트">아파트</option>
                    <option value="빌라/연립">빌라/연립</option>
                    <option value="단독주택">단독주택</option>
                    <option value="오피스텔">오피스텔</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400">반려동물 보유 *</label>
                  <select className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none"
                    value={form.hasPet} onChange={e => handleInputChange('hasPet', e.target.value)}>
                    <option value="">선택하세요</option>
                    <option value="있음">있음</option>
                    <option value="없음">없음</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* 3. 직업 정보 */}
          <section>
            <h2 className="text-xl font-black mb-6 text-gray-900 border-b-2 border-amber-700 pb-3">💼 직업 정보</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400">현재 직업 *</label>
                <select className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none"
                  value={form.currentJob} onChange={e => handleInputChange('currentJob', e.target.value)}>
                  <option value="">선택하세요</option>
                  <option value="학생">학생</option>
                  <option value="직장인">직장인</option>
                  <option value="프리랜서">프리랜서</option>
                  <option value="주부">주부</option>
                  <option value="무직">무직</option>
                  <option value="기타">기타 (직접 입력)</option>
                </select>
              </div>
              
              {form.currentJob === '기타' && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400">직업 직접 입력</label>
                  <input type="text" placeholder="직업을 입력하세요" className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none"
                    value={form.currentJobDirect} onChange={e => handleInputChange('currentJobDirect', e.target.value)} />
                </div>
              )}

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <input type="checkbox" checked={form.canDeclareIncome} onChange={e => handleInputChange('canDeclareIncome', e.target.checked)}
                  className="w-5 h-5 accent-amber-700" />
                <label className="text-sm font-bold text-gray-700">소득 신고 가능 (3.3% 원천징수)</label>
              </div>
            </div>
          </section>

          {/* 4. 활동 정보 */}
          <section>
            <h2 className="text-xl font-black mb-6 text-gray-900 border-b-2 border-amber-700 pb-3">📅 활동 정보</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400">월 활동 가능 일수 *</label>
                <select className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none"
                  value={form.activeDaysPerMonth} onChange={e => handleInputChange('activeDaysPerMonth', e.target.value)}>
                  <option value="">선택하세요</option>
                  <option value="주 1~2회 (월 4~8일)">주 1~2회 (월 4~8일)</option>
                  <option value="주 3~4회 (월 12~16일)">주 3~4회 (월 12~16일)</option>
                  <option value="주 5회 이상 (월 20일+)">주 5회 이상 (월 20일+)</option>
                  <option value="매일 가능">매일 가능</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400">활동 가능 요일 * (복수 선택 가능)</label>
                <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                  {['월', '화', '수', '목', '금', '토', '일'].map(day => (
                    <label key={day} className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                      <input type="checkbox" checked={form.availableDays?.includes(day)} onChange={() => handleCheckboxChange('availableDays', day)}
                        className="w-4 h-4 accent-amber-700" />
                      <span className="text-sm font-bold">{day}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400">활동 가능 시간대 * (복수 선택 가능)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['오전 (06:00~12:00)', '오후 (12:00~18:00)', '저녁 (18:00~22:00)', '야간 (22:00~06:00)'].map(time => (
                    <label key={time} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors text-xs">
                      <input type="checkbox" checked={form.availableTimes?.includes(time)} onChange={() => handleCheckboxChange('availableTimes', time)}
                        className="w-4 h-4 accent-amber-700" />
                      <span className="font-bold">{time}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400">주 활동 지역 *</label>
                  <input type="text" placeholder="예: 서울 강남구, 수원시 영통구" className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none"
                    value={form.activityRegion} onChange={e => handleInputChange('activityRegion', e.target.value)} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400">이동 수단 *</label>
                  <select className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none"
                    value={form.transportation} onChange={e => handleInputChange('transportation', e.target.value)}>
                    <option value="">선택하세요</option>
                    <option value="자가용">자가용</option>
                    <option value="대중교통">대중교통</option>
                    <option value="도보">도보</option>
                    <option value="자전거/전동킥보드">자전거/전동킥보드</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* 5. 반려동물 경험 */}
          <section>
            <h2 className="text-xl font-black mb-6 text-gray-900 border-b-2 border-amber-700 pb-3">🐾 반려동물 경험</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400">고양이 돌봄 경험 *</label>
                <textarea placeholder="고양이를 돌본 경험을 자세히 적어주세요. (없다면 '없음'이라고 적어주세요)"
                  className="w-full h-28 p-4 bg-gray-50 rounded-xl font-bold outline-none resize-none"
                  value={form.catExperience} onChange={e => handleInputChange('catExperience', e.target.value)} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400">강아지 돌봄 경험 *</label>
                <textarea placeholder="강아지를 돌본 경험을 자세히 적어주세요. (없다면 '없음'이라고 적어주세요)"
                  className="w-full h-28 p-4 bg-gray-50 rounded-xl font-bold outline-none resize-none"
                  value={form.dogExperience} onChange={e => handleInputChange('dogExperience', e.target.value)} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400">기타 동물 돌봄 경험</label>
                <textarea placeholder="햄스터, 토끼, 새 등 다른 동물 경험이 있다면 적어주세요"
                  className="w-full h-20 p-4 bg-gray-50 rounded-xl font-bold outline-none resize-none"
                  value={form.otherPetExp} onChange={e => handleInputChange('otherPetExp', e.target.value)} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400">업계 종사 경험</label>
                <textarea placeholder="동물 관련 업종 (동물병원, 애견샵, 펫샵 등) 근무 경험이 있다면 적어주세요"
                  className="w-full h-20 p-4 bg-gray-50 rounded-xl font-bold outline-none resize-none"
                  value={form.industryExp} onChange={e => handleInputChange('industryExp', e.target.value)} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400">펫시터 활동 이력</label>
                <textarea placeholder="다른 플랫폼에서 펫시터를 해본 적이 있다면 적어주세요"
                  className="w-full h-20 p-4 bg-gray-50 rounded-xl font-bold outline-none resize-none"
                  value={form.sitterHistory} onChange={e => handleInputChange('sitterHistory', e.target.value)} />
              </div>
            </div>
          </section>

          {/* 6. 지원 동기 */}
          <section>
            <h2 className="text-xl font-black mb-6 text-gray-900 border-b-2 border-amber-700 pb-3">💭 지원 동기</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400">펫시터에 지원하는 이유 *</label>
                <textarea placeholder="펫시터의 정석에 지원하시는 이유와 각오를 자유롭게 적어주세요"
                  className="w-full h-32 p-4 bg-gray-50 rounded-xl font-bold outline-none resize-none"
                  value={form.motivation} onChange={e => handleInputChange('motivation', e.target.value)} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-gray-400">저희를 어떻게 알게 되셨나요?</label>
                <select className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none"
                  value={form.discoveryPath} onChange={e => handleInputChange('discoveryPath', e.target.value)}>
                  <option value="">선택하세요</option>
                  <option value="지인 추천">지인 추천</option>
                  <option value="인터넷 검색">인터넷 검색</option>
                  <option value="SNS (인스타/페북)">SNS (인스타/페북)</option>
                  <option value="당근마켓">당근마켓</option>
                  <option value="기타">기타 (직접 입력)</option>
                </select>
              </div>

              {form.discoveryPath === '기타' && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-gray-400">경로 직접 입력</label>
                  <input type="text" placeholder="발견 경로를 입력하세요" className="w-full p-4 bg-gray-50 rounded-xl font-bold outline-none"
                    value={form.discoveryPathDirect} onChange={e => handleInputChange('discoveryPathDirect', e.target.value)} />
                </div>
              )}
            </div>
          </section>

          {/* 7. 동의 사항 */}
          <section>
            <h2 className="text-xl font-black mb-6 text-gray-900 border-b-2 border-amber-700 pb-3">✅ 필수 동의 사항</h2>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                <input type="checkbox" checked={form.agreedToProgram} onChange={e => handleInputChange('agreedToProgram', e.target.checked)}
                  className="w-5 h-5 accent-amber-700 mt-0.5" />
                <span className="text-sm font-bold text-gray-700">교육 프로그램 참여에 동의합니다. (오리엔테이션 및 교육 필수)</span>
              </label>

              <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                <input type="checkbox" checked={form.agreedToFee} onChange={e => handleInputChange('agreedToFee', e.target.checked)}
                  className="w-5 h-5 accent-amber-700 mt-0.5" />
                <span className="text-sm font-bold text-gray-700">플랫폼 수수료 정책에 동의합니다. (예약금의 30%)</span>
              </label>

              <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                <input type="checkbox" checked={form.noCriminalRecord} onChange={e => handleInputChange('noCriminalRecord', e.target.checked)}
                  className="w-5 h-5 accent-amber-700 mt-0.5" />
                <span className="text-sm font-bold text-gray-700">동물 관련 범죄 경력이 없음을 확인합니다.</span>
              </label>

              <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                <input type="checkbox" checked={form.smokingPledge} onChange={e => handleInputChange('smokingPledge', e.target.checked)}
                  className="w-5 h-5 accent-amber-700 mt-0.5" />
                <span className="text-sm font-bold text-gray-700">돌봄 중 절대 흡연하지 않을 것을 서약합니다.</span>
              </label>

              <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors">
                <input type="checkbox" checked={form.safetyPledge} onChange={e => handleInputChange('safetyPledge', e.target.checked)}
                  className="w-5 h-5 accent-amber-700 mt-0.5" />
                <span className="text-sm font-bold text-gray-700">안전 수칙을 준수하고 사고 발생 시 즉시 보고할 것을 서약합니다.</span>
              </label>
            </div>
          </section>

          {/* 8. 전자 서명 */}
          <section>
            <h2 className="text-xl font-black mb-6 text-gray-900 border-b-2 border-amber-700 pb-3">✍️ 전자 서명</h2>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-gray-400">성명 입력 (서명으로 대체) *</label>
              <input type="text" placeholder="성명을 정확히 입력하세요" className="w-full p-5 bg-gray-50 rounded-xl font-black text-lg outline-none text-center"
                value={form.signature} onChange={e => handleInputChange('signature', e.target.value)} />
              <p className="text-[10px] text-gray-400 text-center font-bold mt-2">
                위 내용이 사실임을 확인하며, 허위 사실 발견 시 활동 제한에 동의합니다.
              </p>
            </div>
          </section>

          {/* 제출 버튼 */}
          <button 
            onClick={handleSubmit} 
            disabled={submitting} 
            className="w-full bg-gradient-to-r from-amber-700 to-amber-600 text-white py-6 rounded-2xl font-black text-lg shadow-xl transition-all hover:shadow-2xl active:scale-95 disabled:opacity-50"
          >
            {submitting ? '제출 중...' : '✨ 지원서 최종 제출하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Apply;
