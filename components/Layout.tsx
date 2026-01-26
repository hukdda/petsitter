
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import LoginModal from './LoginModal';

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  setUser: (user: any) => void;
}

const Navbar: React.FC<{ user: any; setUser: (user: any) => void; onLoginClick: () => void }> = ({ user, setUser, onLoginClick }) => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    if (window.Kakao && !window.Kakao.isInitialized()) {
      try { window.Kakao.init('4e82f00882c1c24d0b83c1e001adce2f'); } catch (e) { console.error('Kakao Init Error:', e); }
    }
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 shadow-md h-16' : 'bg-white/90 backdrop-blur-sm h-16 md:h-[88px]'
    } flex items-center border-b border-gray-100 px-4 md:px-6`}>
      <div className="container mx-auto flex justify-between items-center w-full">
        <Link to="/" className="text-amber-700 font-[900] text-lg md:text-2xl flex items-center group">
          <span className="mr-1.5 text-base md:text-xl group-hover:rotate-12 transition-transform">🐾</span> 펫시터의 정석
        </Link>
        
        <nav className="hidden lg:flex items-center gap-10">
          <Link to="/#trust" className="text-gray-600 font-bold hover:text-amber-700">서비스 특징</Link>
          <a href="#reviews" className="text-gray-600 font-bold hover:text-amber-700">리뷰</a>
          <a href="#faq" className="text-gray-600 font-bold hover:text-amber-700">FAQ</a>
          <Link to="/apply" className="text-gray-600 font-bold hover:text-amber-700">전문가 지원</Link>
        </nav>

        <div className="flex items-center gap-3 md:gap-4">
          {user ? (
            <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
              <span className="text-[10px] md:text-xs font-black text-amber-800">{user.name}</span>
              <button onClick={() => { localStorage.removeItem('user'); setUser(null); }} className="text-[9px] text-gray-400 font-bold ml-1">LOGOUT</button>
            </div>
          ) : (
            <button onClick={onLoginClick} className="text-gray-500 font-bold text-[11px] md:text-sm hover:text-amber-700">로그인</button>
          )}
          <Link to="/calculator" className="bg-amber-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl text-[11px] md:text-sm font-black shadow-lg hover:bg-amber-800 transition-all active:scale-95">
            예약하기
          </Link>
        </div>
      </div>
    </header>
  );
};

const Layout: React.FC<LayoutProps> = ({ children, user, setUser }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  const openKakaoChat = () => {
    if (window.Kakao && window.Kakao.Channel) { window.Kakao.Channel.chat({ channelPublicId: '_FgxjQn' }); }
    else { window.open('https://pf.kakao.com/_FgxjQn/chat', '_blank'); }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} setUser={setUser} onLoginClick={() => setIsLoginOpen(true)} />
      {/* 
        중요: 상단 헤더 높이만큼 Padding-Top(pt-16)을 주어 
        내용이 헤더 뒤로 가려지는 현상을 근본적으로 방지합니다.
      */}
      <main className="flex-grow pt-16 md:pt-[88px] relative z-10">
        {children}
      </main>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLoginSuccess={setUser} />
      
      <div className="hidden md:flex fixed bottom-8 right-6 z-[90] flex-col gap-3">
        <button onClick={openKakaoChat} className="float-btn bg-kakao text-[#3c1e1e] px-5 py-4 rounded-[2rem] font-black shadow-2xl flex items-center gap-2 border-2 border-[#f7e317] hover:scale-105 transition-all">
          <div className="bg-[#3c1e1e] text-kakao text-[9px] px-1 py-0.5 rounded font-black">TALK</div>
          <span className="text-base">채팅 문의</span>
        </button>
      </div>

      <footer className="bg-[#1a1c1e] text-gray-500 py-12 md:py-16 px-6 pb-32 md:pb-20 border-t border-white/5 relative z-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12 mb-12 text-center md:text-left">
            <div className="space-y-6">
              <h4 className="text-white font-[950] text-xl flex items-center justify-center md:justify-start gap-2">
                <span className="text-2xl">🐾</span> 펫시터의 정석
              </h4>
              <div className="space-y-2 text-[11px] md:text-xs font-medium leading-relaxed">
                <p className="text-gray-400">전국 어디서나 검증된 전문가가 방문하는 프리미엄 홈케어</p>
                <div className="flex flex-col md:flex-row md:flex-wrap items-center md:justify-start gap-x-4 gap-y-1 pt-2 opacity-60">
                  <span>대표자: 박문기</span>
                  <span>사업자번호: 561-23-02161</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <strong className="text-white text-[10px] uppercase tracking-widest font-black opacity-50">Contact</strong>
              <div className="flex flex-col gap-2">
                <a href="tel:0507-1344-6573" className="text-amber-500 font-black text-xl">0507-1344-6573</a>
                <p className="text-[10px] font-bold">daegupetsit@naver.com</p>
                <p className="text-[10px] font-bold">상담: 08:00 ~ 22:00 (연중무휴)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-1 gap-6 md:gap-4">
              <div className="space-y-4">
                <strong className="text-white text-[10px] uppercase tracking-widest font-black opacity-50">Quick Links</strong>
                <div className="flex flex-col gap-2 text-[11px] font-bold">
                  <Link to="/apply" className="hover:text-white">전문가 지원</Link>
                  <Link to="/calculator" className="hover:text-white">실시간 견적</Link>
                </div>
              </div>
              <div className="space-y-4">
                <strong className="text-white text-[10px] uppercase tracking-widest font-black opacity-50">Legal</strong>
                <div className="flex flex-col gap-2 text-[11px] font-bold">
                  <Link to="/terms" className="hover:text-white">이용약관</Link>
                  <Link to="/privacy" className="text-amber-600/80 hover:text-white">개인정보처리방침</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-20">© 2025 PET SITTER STANDARD. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 h-20 flex items-center justify-around z-[100] px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.12)]">
          <Link to="/" className="flex flex-col items-center gap-1.5 flex-1 transition-all active:scale-90">
            <span className="text-2xl filter drop-shadow-sm">🏠</span>
            <span className="text-[10px] font-black text-amber-900 tracking-tighter">홈</span>
          </Link>
          <Link to="/calculator" className="flex flex-col items-center gap-1.5 flex-1 transition-all active:scale-90">
            <span className="text-2xl filter drop-shadow-sm">📋</span>
            <span className="text-[10px] font-black text-gray-400 tracking-tighter">예약</span>
          </Link>
          <button onClick={openKakaoChat} className="flex flex-col items-center gap-1.5 flex-1 transition-all active:scale-90">
            <div className="bg-kakao w-8 h-8 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3c1e1e"><path d="M12 3C6.477 3 2 6.48 2 10.791c0 2.758 1.83 5.161 4.587 6.556l-1.159 4.255c-.07.258.21.464.415.303l5.013-3.292c.376.041.76.069 1.144.069 5.523 0 10-3.48 10-7.791S17.523 3 12 3z"/></svg>
            </div>
            <span className="text-[10px] font-black text-gray-400 tracking-tighter">상담</span>
          </button>
          <button onClick={() => setIsLoginOpen(true)} className="flex flex-col items-center gap-1.5 flex-1 transition-all active:scale-90">
            <span className="text-2xl filter drop-shadow-sm">👤</span>
            <span className="text-[10px] font-black text-gray-400 tracking-tighter">마이</span>
          </button>
      </div>
    </div>
  );
};

export default Layout;
