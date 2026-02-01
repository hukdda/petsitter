import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Link, 
  useNavigate, 
  useLocation 
} from 'react-router-dom';

/**
 * 1. 환경 설정 및 상수
 */
const GOOGLE_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/example/exec"; // 대표님 전용 Webhook

const REGIONS = ['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];

const SERVICE_OPTIONS = [
  { id: 'care30', name: '방문 돌봄 30분', basePrice: 18000 },
  { id: 'care60', name: '방문 돌봄 60분', basePrice: 25000 },
  { id: 'care90', name: '방문 돌봄 90분', basePrice: 32000 },
  { id: 'bath', name: '방문 목욕 (소형견)', basePrice: 50000 },
];

/**
 * 2. API 서비스
 */
const api = {
  async logData(type: 'BOOKING' | 'APPLY', data: any) {
    console.log(`[DATA_LOG] ${type}:`, data);
    try {
      await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...data, timestamp: new Date().toISOString() })
      });
    } catch (e) {
      console.warn("Log delayed:", e);
    }
    return { success: true };
  },
  async fetchComments() {
    return [
      { id: 1, author: '김*은', sitterName: '이진영 시터', region: '서울 강남구', serviceType: '방문 돌봄 60분', content: '여행 가있는 동안 너무 안심하고 다녀왔어요. 사진도 계속 보내주시고 아이가 시터님을 너무 좋아하는게 눈에 보이네요!', profileImg: 'https://i.pravatar.cc/100?u=1', relativeTime: '2시간 전' },
      { id: 2, author: '이*준', sitterName: '박서연 시터', region: '경기 분당', serviceType: '방문 산책 30분', content: '산책 가기 힘든 날이었는데 덕분에 아이가 스트레스 안 받고 잘 쉬었습니다. 다음에도 꼭 부탁드리고 싶어요.', profileImg: 'https://i.pravatar.cc/100?u=2', relativeTime: '5시간 전' },
    ];
  }
};

/**
 * 3. 공통 컴포넌트
 */
const Navbar = ({ user, onLogout, onLoginClick }: any) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 flex items-center px-4 md:px-8 border-b ${
      scrolled ? 'bg-white shadow-md h-16' : 'bg-white/90 backdrop-blur-sm h-16 md:h-20'
    }`}>
      <div className="container mx-auto flex justify-between items-center w-full">
        <Link to="/" className="text-amber-700 font-[950] text-xl md:text-2xl flex items-center">
          <span className="mr-2">🐾</span> 펫시터의 정석
        </Link>
        <div className="flex items-center gap-4 md:gap-8">
          <nav className="hidden lg:flex gap-8 text-sm font-black text-gray-500">
            <Link to="/apply" className="hover:text-amber-700 transition-colors">펫시터 지원하기</Link>
          </nav>
          {user ? (
            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
              <span className="text-[11px] font-black text-amber-800">{user.name} 님</span>
              <button onClick={onLogout} className="text-[10px] text-gray-400 font-bold ml-1">LOGOUT</button>
            </div>
          ) : (
            <button onClick={onLoginClick} className="text-gray-400 font-bold text-xs md:text-sm">로그인</button>
          )}
          <Link to="/calculator" className="bg-amber-700 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-xl text-xs md:text-sm font-[950] shadow-lg hover:bg-amber-800 active:scale-95 transition-all">
            예약하기
          </Link>
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-zinc-900 text-zinc-500 py-16 px-6 pb-32">
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
      <div className="space-y-4">
        <h4 className="text-white font-[950] text-xl">🐾 펫시터의 정석</h4>
        <p className="text-xs leading-relaxed opacity-60">전국 어디서나 검증된 전문가가 방문하는<br/>프리미엄 반려동물 홈케어 서비스</p>
        <p className="text-[10px] opacity-30">대표자: 박문기 | 사업자번호: 561-23-02161</p>
      </div>
      <div className="space-y-4">
        <h4 className="text-white text-[10px] font-black uppercase tracking-widest opacity-40">Contact</h4>
        <a href="tel:0507-1344-6573" className="text-amber-500 font-black text-2xl block">0507-1344-6573</a>
        <p className="text-xs">daegupetsit@naver.com | 상담: 08시 ~ 22시</p>
      </div>
      <div className="flex flex-col gap-3 text-xs font-bold">
        <Link to="/apply" className="hover:text-white">펫시터 지원하기</Link>
        <Link to="/privacy" className="text-amber-600 hover:text-white">개인정보처리방침</Link>
        <p className="text-[9px] opacity-20 uppercase tracking-widest mt-4">© 2025 PET SITTER STANDARD</p>
      </div>
    </div>
  </footer>
);

/**
 * 4. 페이지 컴포넌트
 */
const Home = () => {
  const [comments, setComments] = useState<any[]>([]);
  useEffect(() => { api.fetchComments().then(setComments); }, []);

  return (
    <div className="pt-16">
      {/* 모바일 최적화 히어로 섹션 */}
      <section className="relative h-[550px] md:h-[750px] overflow-hidden bg-black">
        <img 
          src="https://i.imgur.com/bPTZ1Zv.png" 
          alt="Premium Pet Sitter" 
          className="absolute inset-0 w-full h-full object-cover opacity-90 scale-[1.5] md:scale-105 object-[75%_center] md:object-center transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        <div className="relative z-10 h-full container mx-auto px-6 flex items-center">
          <div className="max-w-[280px] md:max-w-xl space-y-6">
            <span className="inline-block bg-amber-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl">1:1 비대면 면접 검증 완료</span>
            <h1 className="text-3xl md:text-6xl font-[950] text-white leading-[1.2] drop-shadow-2xl">
              전국 어디서나<br />
              <span className="text-amber-400">내 집에서 편안하게</span>
            </h1>
            <p className="text-sm md:text-lg text-white/90 font-bold leading-relaxed drop-shadow-md">
              현지에 거주하는 검증된 전문가가<br className="md:hidden" /> 더 세심하게 우리 아이를 돌봅니다.
            </p>
            <div className="pt-4">
              <Link to="/calculator" className="inline-block bg-amber-700 text-white px-8 py-4 rounded-2xl font-black text-sm md:text-lg shadow-2xl active:scale-95 transition-all">
                돌봄 비용 확인하기 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Points */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-4xl font-black mb-12 tracking-tight">왜 '펫시터의 정석' 인가요?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: '📄', title: '신원 증빙', desc: '주민등록등본 및 거주지 확인 완료' },
              { icon: '👥', title: '대면 면접', desc: '가치관과 전문성을 확인하는 심층 면접' },
              { icon: '🛡️', title: '범죄경력 검증', desc: '결격 사유 없는 청정 파트너 의무화' },
              { icon: '🚑', title: '안전 보상', desc: '돌봄 중 사고 대응 매뉴얼 확보' },
            ].map((item, i) => (
              <div key={i} className="bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-100 hover:bg-amber-50 transition-colors duration-300">
                <div className="text-4xl mb-6">{item.icon}</div>
                <h3 className="text-lg font-black mb-2">{item.title}</h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 bg-zinc-50">
        <div className="container mx-auto px-6 max-w-2xl">
          <h2 className="text-xl font-black mb-10 flex items-center gap-2">📱 보호자 리얼 돌봄톡</h2>
          <div className="space-y-6">
            {comments.map(c => (
              <div key={c.id} className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-zinc-100">
                <div className="flex items-center gap-4 mb-4">
                  <img src={c.profileImg} className="w-10 h-10 rounded-full" alt="avatar" />
                  <div>
                    <div className="text-sm font-black text-gray-900">{c.sitterName}</div>
                    <div className="text-[10px] text-amber-700 font-bold">{c.region} · {c.serviceType}</div>
                  </div>
                </div>
                <p className="text-sm text-zinc-700 leading-relaxed font-medium">{c.content}</p>
                <div className="mt-4 pt-4 border-t border-zinc-50 flex justify-between text-[10px] font-bold text-zinc-300">
                  <span>보호자 {c.author}</span>
                  <span>{c.relativeTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const Calculator = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: 'care30',
    petCount: 1,
    startDate: new Date().toISOString().split('T')[0],
    userName: '',
    userPhone: '',
    address: '',
    petName: '',
    depositorName: ''
  });
  const [price, setPrice] = useState(18000);

  useEffect(() => {
    const base = SERVICE_OPTIONS.find(s => s.id === formData.serviceId)?.basePrice || 0;
    const extra = (formData.petCount - 1) * 5000;
    setPrice(base + extra);
  }, [formData.serviceId, formData.petCount]);

  const handleSubmit = async () => {
    if (!formData.depositorName) return alert('입금자명을 입력해 주세요.');
    setLoading(true);
    await api.logData('BOOKING', { ...formData, totalPrice: price });
    setStep(4);
    setLoading(false);
  };

  if (step === 4) return (
    <div className="min-h-screen bg-white pt-32 px-6 flex items-center justify-center text-center">
      <div className="max-w-md w-full p-12 bg-amber-50 rounded-[3rem] border border-amber-100 space-y-8 animate-in slide-in-from-bottom-4">
        <span className="text-7xl">🎉</span>
        <h2 className="text-3xl font-[950]">예약 접수 완료!</h2>
        <p className="text-sm font-bold text-amber-900/60 leading-relaxed">
          입금 확인 후 예약이 최종 확정됩니다.<br />
          전문 시터님이 배정되면 즉시 안내 문자를 드릴게요.
        </p>
        <Link to="/" className="block w-full bg-zinc-900 text-white py-5 rounded-2xl font-black shadow-xl">홈으로 이동</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 pt-28 pb-40 px-6">
      <div className="max-w-xl mx-auto bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 relative border border-zinc-100">
        {loading && <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center"><div className="spinner"></div></div>}
        
        {step === 1 && (
          <div className="space-y-8">
            <h2 className="text-2xl font-black tracking-tight text-center">돌봄 견적 확인</h2>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Service</label>
                <select value={formData.serviceId} onChange={e => setFormData(p => ({ ...p, serviceId: e.target.value }))} className="w-full p-4 bg-zinc-50 rounded-2xl font-black text-amber-900 border-none outline-none">
                  {SERVICE_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Date</label>
                  <input type="date" value={formData.startDate} onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))} className="w-full p-4 bg-zinc-50 rounded-2xl font-bold border-none" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-2">Pet Count</label>
                  <input type="number" min="1" value={formData.petCount} onChange={e => setFormData(p => ({ ...p, petCount: Number(e.target.value) }))} className="w-full p-4 bg-zinc-50 rounded-2xl font-bold border-none" />
                </div>
              </div>
            </div>
            <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100 text-center">
              <div className="text-[10px] font-black text-amber-700 uppercase mb-1">Expected Price</div>
              <div className="text-4xl font-[950] text-zinc-900">{price.toLocaleString()}원</div>
              {formData.petCount > 1 && <div className="mt-2 text-[10px] font-black text-amber-600">다견 할증 적용됨</div>}
            </div>
            <button onClick={() => setStep(2)} className="w-full bg-amber-700 text-white py-6 rounded-2xl font-black shadow-lg">예약 정보 입력하기</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black tracking-tight text-center">정보 입력</h2>
            <div className="space-y-4">
              <input type="text" placeholder="예약자 성함" className="w-full p-5 bg-zinc-50 rounded-2xl font-bold outline-none" value={formData.userName} onChange={e => setFormData(p => ({ ...p, userName: e.target.value }))} />
              <input type="tel" placeholder="연락처" className="w-full p-5 bg-zinc-50 rounded-2xl font-bold outline-none" value={formData.userPhone} onChange={e => setFormData(p => ({ ...p, userPhone: e.target.value }))} />
              <input type="text" placeholder="방문 주소" className="w-full p-5 bg-zinc-50 rounded-2xl font-bold outline-none" value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} />
              <input type="text" placeholder="아이 이름" className="w-full p-5 bg-zinc-50 rounded-2xl font-bold outline-none" value={formData.petName} onChange={e => setFormData(p => ({ ...p, petName: e.target.value }))} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-5 rounded-2xl font-bold border-2 border-zinc-100 text-zinc-300">이전</button>
              <button onClick={() => setStep(3)} className="flex-[2] bg-amber-700 text-white py-5 rounded-2xl font-black shadow-lg">결제 확인</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-center">무통장 입금 안내</h2>
              <p className="text-sm font-bold text-zinc-400">아래 계좌로 입금해 주시면 예약이 최종 접수됩니다.</p>
            </div>
            <div className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100 space-y-6">
               <div className="text-center">
                 <div className="text-[10px] font-black text-amber-700 uppercase mb-2">Bank Account</div>
                 <div className="text-2xl font-black text-zinc-900">우리은행 1002-530-309015</div>
                 <div className="text-base font-bold text-amber-900 mt-1">예금주: 박문기</div>
               </div>
               <div className="pt-4 border-t border-amber-200 text-center">
                 <div className="text-[10px] font-black text-amber-700 uppercase mb-1">Total Amount</div>
                 <div className="text-3xl font-[950] text-red-600">{price.toLocaleString()}원</div>
               </div>
            </div>
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block text-center">실제 입금자 성함</label>
              <input 
                type="text" 
                placeholder="입금자명을 입력하세요" 
                className="w-full p-5 bg-white border-2 border-amber-100 rounded-2xl font-black text-center shadow-sm outline-none focus:border-amber-700" 
                value={formData.depositorName} 
                onChange={e => setFormData(p => ({ ...p, depositorName: e.target.value }))} 
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-5 rounded-2xl font-bold border-2 border-zinc-100 text-zinc-300">이전</button>
              <button onClick={handleSubmit} className="flex-[2] bg-zinc-900 text-white py-5 rounded-2xl font-black shadow-xl">예약 신청하기</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Apply = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', region: '서울', experience: '' });

  const handleApply = async (e: any) => {
    e.preventDefault();
    if (!form.name || !form.phone) return alert('필수 항목을 모두 입력해 주세요.');
    setLoading(true);
    await api.logData('APPLY', form);
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) return (
    <div className="min-h-screen bg-white pt-40 px-6 text-center">
      <div className="max-w-md mx-auto space-y-8 animate-in zoom-in-95">
        <span className="text-7xl">🤝</span>
        <h2 className="text-3xl font-[950]">지원서 접수 완료!</h2>
        <p className="text-sm font-bold text-zinc-400 leading-relaxed">
          보내주신 소중한 지원서를 확인 후,<br/>
          순차적으로 개별 연락드리겠습니다. 감사합니다!
        </p>
        <Link to="/" className="block w-full bg-amber-700 text-white py-5 rounded-2xl font-black shadow-xl">홈으로 이동</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-40 px-6">
      <div className="max-w-xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-[950] tracking-tight text-zinc-900">펫시터 지원하기</h1>
          <p className="text-zinc-500 font-bold">아이들을 사랑하는 따뜻한 시터님을 기다립니다.</p>
        </div>
        <form onSubmit={handleApply} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-zinc-100 space-y-6">
          <div className="space-y-4">
            <input type="text" placeholder="성함 (실명)" className="w-full p-5 bg-zinc-50 rounded-2xl font-bold outline-none" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <input type="tel" placeholder="연락처 (010-0000-0000)" className="w-full p-5 bg-zinc-50 rounded-2xl font-bold outline-none" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            <select className="w-full p-5 bg-zinc-50 rounded-2xl font-bold outline-none" value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))}>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <textarea placeholder="반려동물 양육 경험이나 관련 경력을 자유롭게 적어주세요." className="w-full h-40 p-5 bg-zinc-50 rounded-2xl font-bold outline-none resize-none" value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-amber-700 text-white py-6 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all">
            {loading ? '지원 중...' : '지원서 제출하기'}
          </button>
        </form>
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-sans selection:bg-amber-100">
        <Navbar user={user} onLogout={() => { localStorage.removeItem('user'); setUser(null); }} onLoginClick={() => alert('카카오 로그인 연동 준비 중입니다.')} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/privacy" element={<div className="pt-40 px-6 max-w-2xl mx-auto font-black text-amber-700">개인정보처리방침...</div>} />
          </Routes>
        </main>
        <Footer />
        <div className="fixed bottom-12 right-6 z-[100]">
           <a href="https://pf.kakao.com/_FgxjQn/chat" target="_blank" rel="noreferrer" className="w-16 h-16 bg-[#FEE500] rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white animate-bounce">
            <svg className="w-8 h-8 text-[#3c1e1e]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.48 2 10.791c0 2.758 1.83 5.161 4.587 6.556l-1.159 4.255c-.07.258.21.464.415.303l5.013-3.292c.376.041.76.069 1.144.069 5.523 0 10-3.48 10-7.791S17.523 3 12 3z"/></svg>
          </a>
        </div>
      </div>
    </BrowserRouter>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);