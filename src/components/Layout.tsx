
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
    if ((window as any).Kakao && !(window as any).Kakao.isInitialized()) {
      try { (window as any).Kakao.init('4e82f00882c1c24d0b83c1e001adce2f'); } catch (e) { console.error('Kakao Init Error:', e); }
    }

    const handleOpenLogin = () => onLoginClick();
    window.addEventListener('OPEN_LOGIN', handleOpenLogin);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('OPEN_LOGIN', handleOpenLogin);
    };
  }, [onLoginClick]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-white/98 shadow-[0_10px_30px_rgba(0,0,0,0.03)] h-16' : 'bg-transparent h-20 md:h-24'
    } flex items-center px-6 md:px-12`}>
      <div className="container mx-auto flex justify-between items-center w-full">
        <Link to="/" className={`font-[1000] text-xl md:text-2xl flex items-center group transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
          <span className="mr-2 text-2xl md:text-3xl group-hover:rotate-12 transition-transform">🐾</span> 펫시터의 정석
        </Link>
        
        <div className="flex items-center gap-3 md:gap-5">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/calculator" className="bg-[#e67e22] text-white px-5 py-2.5 md:px-8 md:py-3.5 rounded-xl md:rounded-2xl text-[11px] md:text-sm font-[1000] shadow-xl hover:bg-[#d35400] transition-all active:scale-95">
                돌봄 비용 알아보기
              </Link>
              <div className="hidden md:flex items-center gap-2 bg-black/5 px-3 py-1.5 rounded-full border border-white/10">
                <img src={user.profileImg} className="w-6 h-6 rounded-full border border-white/20" alt="Me" />
                <button onClick={() => { localStorage.removeItem('user'); setUser(null); }} className={`text-[10px] font-black ${scrolled ? 'text-gray-400' : 'text-white/60'}`}>LOGOUT</button>
              </div>
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="bg-[#FEE500] text-[#191919] px-5 py-2.5 md:px-8 md:py-3.5 rounded-xl md:rounded-2xl text-[11px] md:text-sm font-[1000] shadow-xl flex items-center gap-2 hover:scale-105 transition-all"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.48 2 10.791c0 2.758 1.83 5.161 4.587 6.556l-1.159 4.255c-.07.258.21.464.415.303l5.013-3.292c.376.041.76.069 1.144.069 5.523 0 10-3.48 10-7.791S17.523 3 12 3z"/></svg>
              카카오 로그인
            </button>
          )}

          <Link to="/apply" className={`hidden lg:block font-[1000] text-[11px] px-5 py-2.5 rounded-2xl border transition-all ${
            scrolled ? 'border-gray-200 text-gray-400 hover:border-gray-900 hover:text-gray-900' : 'border-white/20 text-white/60 hover:border-white hover:text-white'
          }`}>
            펫시터 지원하기
          </Link>
        </div>
      </div>
    </header>
  );
};

const Layout: React.FC<LayoutProps> = ({ children, user, setUser }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  
  const openKakaoChat = () => {
    if ((window as any).Kakao && (window as any).Kakao.Channel) { (window as any).Kakao.Channel.chat({ channelPublicId: '_FgxjQn' }); }
    else { window.open('https://pf.kakao.com/_FgxjQn/chat', '_blank'); }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} setUser={setUser} onLoginClick={() => setIsLoginOpen(true)} />
      <main className="flex-grow relative z-10">
        {children}
      </main>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLoginSuccess={setUser} />
      
      {/* PC Floating Buttons */}
      <div className="hidden md:flex fixed bottom-12 right-10 z-[90] flex-col gap-4">
        <button onClick={openKakaoChat} className="float-btn bg-white text-gray-900 px-8 py-5 rounded-[2.5rem] font-black shadow-[0_30px_60px_rgba(0,0,0,0.12)] flex items-center gap-3 border border-gray-100 hover:scale-105 transition-all">
          <div className="bg-amber-500 w-2 h-2 rounded-full animate-pulse"></div>
          <span className="text-base tracking-tight">실시간 채팅 상담</span>
        </button>
      </div>

      <footer className="bg-[#0c0c0c] text-gray-500 pt-32 pb-20 px-6 relative z-20">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
            {/* Brand Area */}
            <div className="lg:col-span-5 space-y-10">
              <h4 className="text-white font-[1000] text-3xl flex items-center gap-3">
                <span className="text-4xl">🐾</span> 펫시터의 정석
              </h4>
              <p className="text-gray-400 text-lg font-bold leading-relaxed max-w-md">
                내 집보다 편안한 곳은 없습니다. 익숙한 공간에서 만나는 품격 있는 반려동물 방문 돌봄 서비스.
              </p>
            </div>

            {/* Link Area 1 */}
            <div className="lg:col-span-2 space-y-8">
              <strong className="text-white text-[10px] uppercase tracking-[0.4em] font-black opacity-30 block">Platform</strong>
              <ul className="flex flex-col gap-5 text-sm font-bold">
                <li><Link to="/" className="hover:text-white transition-colors">홈 화면</Link></li>
                <li><Link to="/calculator" className="hover:text-white transition-colors">실시간 견적</Link></li>
                <li><Link to="/apply" className="hover:text-white transition-colors">펫시터 지원</Link></li>
              </ul>
            </div>

            {/* Link Area 2 */}
            <div className="lg:col-span-2 space-y-8">
              <strong className="text-white text-[10px] uppercase tracking-[0.4em] font-black opacity-30 block">Support</strong>
              <ul className="flex flex-col gap-5 text-sm font-bold">
                <li><Link to="/terms" className="hover:text-white transition-colors">이용약관</Link></li>
                <li><Link to="/privacy" className="hover:text-amber-500 transition-colors text-amber-500/80">개인정보 처리방침</Link></li>
              </ul>
            </div>

            {/* Customer Support */}
            <div className="lg:col-span-3 space-y-8">
              <strong className="text-white text-[10px] uppercase tracking-[0.4em] font-black opacity-30 block">Contact HQ</strong>
              <div className="space-y-4">
                <a href="tel:0507-1344-6573" className="text-white font-[1000] text-4xl tracking-tighter block hover:text-amber-500 transition-colors">0507-1344-6573</a>
              </div>
            </div>
          </div>

          {/* Business Transparency */}
          <div className="pt-16 border-t border-white/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
              <div className="text-[11px] font-bold text-white/20 leading-relaxed uppercase tracking-widest space-y-2">
                <p className="text-white/40">상호명: 펫시터의 정석 | 대표자: 박문기</p>
                <p>사업자등록번호: 561-23-02161 | 주소: 대구광역시 수성구 수성로 367-2, 3층 325호</p>
              </div>
              <p className="text-[10px] font-[1000] uppercase tracking-[0.6em] text-white/10">© 2025 PET SITTER STANDARD.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
