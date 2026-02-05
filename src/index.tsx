
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { api } from './services/api';
import { SERVICE_OPTIONS } from './constants';
import Calculator from './pages/Calculator';
import Admin from './pages/Admin';
import Layout from './components/Layout';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// --- Home Component ---
const Home = ({ user }: { user: any }) => {
  const [comments, setComments] = useState<any[]>([]);
  useEffect(() => {
    api.fetchComments().then(data => { if (Array.isArray(data)) setComments(data); });
  }, []);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative h-[650px] md:h-[850px] flex items-center overflow-hidden bg-black">
        <img src="https://i.imgur.com/bPTZ1Zv.png" className="absolute inset-0 w-full h-full object-cover z-0 scale-[1.55] md:scale-110 object-[72%_25%]" alt="Hero" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent z-10"></div>
        <div className="relative z-20 container mx-auto px-6 md:px-20 text-left">
          <div className="max-w-2xl">
            <div className="inline-block bg-amber-500 text-white px-4 py-1.5 rounded-lg text-xs font-black mb-8 shadow-2xl">Premium Expert Care</div>
            <h1 className="text-4xl md:text-7xl font-[1000] text-white leading-tight mb-8">당신의 반려동물을 위한<br/><span className="text-amber-400">가장 완벽한 파트너</span></h1>
            <p className="text-lg md:text-2xl font-bold text-white/90 mb-12">검증된 시터가 집으로 방문하여<br/>아이의 행복한 일상을 지켜줍니다.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/calculator" className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-12 py-6 rounded-2xl font-black text-xl shadow-2xl transition-all active:scale-95 text-center">지금 예약하기</Link>
              <Link to="/apply" className="inline-block bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 px-12 py-6 rounded-2xl font-black text-xl shadow-2xl transition-all active:scale-95 text-center">시터 지원하기</Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Trust Section */}
      <section className="py-24 bg-[#fafafa]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-black mb-16 uppercase tracking-tighter">왜 펫시터의 정석인가요?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100">
              <div className="text-5xl mb-6">🛡️</div>
              <h3 className="text-xl font-black mb-4">철저한 신원 검증</h3>
              <p className="text-gray-500 font-bold text-sm">신분증 대조 및 거주지 확인은 기본,<br/>철저한 면접을 통과한 분만 활동합니다.</p>
            </div>
            <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100">
              <div className="text-5xl mb-6">📸</div>
              <h3 className="text-xl font-black mb-4">실시간 돌봄 리포트</h3>
              <p className="text-gray-500 font-bold text-sm">돌봄 시작부터 끝까지,<br/>사진과 영상을 실시간으로 전송합니다.</p>
            </div>
            <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100">
              <div className="text-5xl mb-6">💖</div>
              <h3 className="text-xl font-black mb-4">전문적인 맞춤 케어</h3>
              <p className="text-gray-500 font-bold text-sm">노령견, 약물 투여 등<br/>전문적인 케어가 필요한 아이도 안심하세요.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

// --- Apply Wizard Component (Dogmate Style) ---
const Apply = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', birth: '', gender: '여성',
    address: '', residenceType: '아파트', hasPet: '있음',
    experience: '', motivation: '', smoking: '비흡연',
    agreed: false
  });

  const nextStep = () => {
    if (step === 1 && (!form.name || !form.phone || !form.birth)) return alert('인적사항을 모두 입력해 주세요.');
    if (step === 2 && !form.address) return alert('거주 지역을 입력해 주세요.');
    setStep(s => s + 1);
    window.scrollTo(0, 0);
  };

  const handleApply = async () => {
    if (!form.agreed) return alert('약관에 동의해 주세요.');
    setLoading(true);
    try {
      await api.submitApplication(form);
      setSubmitted(true);
    } catch (e) { alert('지원 중 오류가 발생했습니다.'); }
    finally { setLoading(false); }
  };

  if (submitted) return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-16 rounded-[3.5rem] shadow-2xl border border-amber-100">
        <div className="text-7xl mb-8">🏅</div>
        <h2 className="text-3xl font-black mb-4">지원이 완료되었습니다!</h2>
        <p className="text-gray-500 font-bold mb-10 text-sm leading-relaxed">대표님이 서류 검토 후<br/>3일 이내에 개별 연락을 드립니다.</p>
        <Link to="/" className="w-full block bg-gray-900 text-white py-5 rounded-2xl font-black">홈으로 이동</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] py-20 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="flex justify-between items-center mb-12 px-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${step >= s ? 'bg-amber-700 text-white scale-110' : 'bg-white text-gray-300 border border-gray-100'}`}>
                {s}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? 'text-amber-700' : 'text-gray-300'}`}>Step {s}</span>
            </div>
          ))}
        </div>

        <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl border border-gray-100 animate-in fade-in duration-500">
          {step === 1 && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter">시터님에 대해<br/>가장 먼저 알고 싶어요.</h2>
              <div className="space-y-6">
                <input type="text" placeholder="이름" className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-amber-700 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                <input type="tel" placeholder="연락처 (010-0000-0000)" className="w-full p-5 bg-gray-50 rounded-2xl font-bold border-2 border-transparent focus:border-amber-700 outline-none" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">생년월일</label>
                  <input type="date" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none" value={form.birth} onChange={e => setForm({...form, birth: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {['여성', '남성'].map(g => (
                    <button key={g} onClick={() => setForm({...form, gender: g})} className={`p-5 rounded-2xl font-black border-2 transition-all ${form.gender === g ? 'bg-amber-50 border-amber-700 text-amber-900' : 'bg-gray-50 border-transparent text-gray-400'}`}>{g}</button>
                  ))}
                </div>
              </div>
              <button onClick={nextStep} className="w-full bg-amber-700 text-white py-6 rounded-2xl font-black text-lg shadow-xl">다음 단계로 →</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter">활동 지역과<br/>거주 환경을 알려주세요.</h2>
              <div className="space-y-6">
                <input type="text" placeholder="주 활동 지역 (예: 부산 해운대구)" className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-amber-700" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">거주 형태</label>
                    <select className="w-full p-5 bg-gray-50 rounded-2xl font-black outline-none" value={form.residenceType} onChange={e => setForm({...form, residenceType: e.target.value})}>
                      <option>아파트</option><option>빌라</option><option>오피스텔</option><option>단독주택</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">흡연 여부</label>
                    <select className="w-full p-5 bg-gray-50 rounded-2xl font-black outline-none" value={form.smoking} onChange={e => setForm({...form, smoking: e.target.value})}>
                      <option>비흡연</option><option>흡연</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="flex-1 py-6 bg-gray-100 rounded-2xl font-black text-gray-400">이전</button>
                <button onClick={nextStep} className="flex-[2] bg-amber-700 text-white py-6 rounded-2xl font-black text-lg shadow-xl">다음 단계로 →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter">반려동물과 함께한<br/>경험이 있으신가요?</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {['있음', '없음'].map(opt => (
                    <button key={opt} onClick={() => setForm({...form, hasPet: opt})} className={`p-8 rounded-[2rem] font-black text-xl border-4 transition-all ${form.hasPet === opt ? 'bg-amber-50 border-amber-700 text-amber-900 scale-105' : 'bg-gray-50 border-transparent text-gray-300'}`}>{opt}</button>
                  ))}
                </div>
                <textarea placeholder="반려동물과 함께한 시간이나 돌봄 경험을 구체적으로 알려주세요." className="w-full h-48 p-6 bg-gray-50 rounded-[2rem] font-bold outline-none border-2 border-transparent focus:border-amber-700 resize-none" value={form.experience} onChange={e => setForm({...form, experience: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 py-6 bg-gray-100 rounded-2xl font-black text-gray-400">이전</button>
                <button onClick={nextStep} className="flex-[2] bg-amber-700 text-white py-6 rounded-2xl font-black text-lg shadow-xl">다음 단계로 →</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter">마지막으로,<br/>지원 동기를 알려주세요.</h2>
              <div className="space-y-6">
                <textarea placeholder="왜 펫시터가 되고 싶으신가요? (자유롭게 기술)" className="w-full h-48 p-6 bg-gray-50 rounded-[2rem] font-bold outline-none border-2 border-transparent focus:border-amber-700 resize-none" value={form.motivation} onChange={e => setForm({...form, motivation: e.target.value})} />
                <label className="flex items-center gap-4 p-6 bg-amber-50 rounded-3xl cursor-pointer">
                  <input type="checkbox" checked={form.agreed} onChange={e => setForm({...form, agreed: e.target.checked})} className="w-6 h-6 accent-amber-700" />
                  <span className="text-xs font-black text-amber-900">개인정보 수집 및 대면 인터뷰 참여에 동의합니다.</span>
                </label>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStep(3)} className="flex-1 py-6 bg-gray-100 rounded-2xl font-black text-gray-400">이전</button>
                <button onClick={handleApply} className="flex-[2] bg-gray-900 text-white py-6 rounded-2xl font-black text-lg shadow-2xl transition-all active:scale-95">{loading ? '제출 중...' : '지원 완료하기'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App ---
const App = () => {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Layout user={user} setUser={setUser}>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </Router>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<React.StrictMode><App /></React.StrictMode>);
}

export default App;
