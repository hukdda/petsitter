import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(true);

  if (!isOpen) return null;

  const handleSocialLogin = (provider: 'kakao') => {
    if (!agreed) {
      alert('이용약관 및 개인정보 처리방침에 동의해 주세요.');
      return;
    }
    
    setLoading(provider);
    
    // ✅ 중요: 카카오 인증 후 코드를 받아줄 서버 API 주소입니다.
    // Vercel의 api/auth.js가 이 경로(/api/auth/social)에서 대기 중이어야 합니다.
    const redirectUri = `${window.location.origin}/api/auth/social`; 
    
    localStorage.setItem('social_provider', provider);
    
    if (provider === 'kakao') {
      const clientId = "4e82f00882c1c24d0b83c1e001adce2f";
      
      // ✅ 카카오 인증 페이지로 이동하는 정석 URL 구성
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
      });

      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
      
      // 인증 페이지로 이동 (이 코드가 실행되면 노란색 카카오 로그인창이 뜹니다)
      window.location.href = kakaoAuthUrl;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[1000] overflow-y-auto bg-black/80 backdrop-blur-md flex justify-center items-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-white w-full max-w-[380px] rounded-[3rem] shadow-2xl animate-modal-pop overflow-hidden border border-gray-100">
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-gray-300 hover:text-gray-900 text-xl z-40 p-2"
        >
          ✕
        </button>
        
        <div className="p-8 pt-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 rounded-2xl mb-4">
              <span className="text-3xl">🐾</span>
            </div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tighter">간편 회원가입</h3>
            <p className="text-gray-400 text-xs font-bold mt-1">
              카카오로 3초 만에 가입하고 시작하세요.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-5 mb-8 border border-gray-100">
            <div className="text-[10px] font-black text-amber-700 mb-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-amber-700 rounded-full animate-pulse"></span>
              회원가입 시 수집 항목 안내
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-gray-500">필수 항목</span>
                <span className="text-gray-900">성명, 휴대폰번호, 성별, 연령대</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-gray-500">이용 목적</span>
                <span className="text-gray-900">본인 확인 및 맞춤 시터 매칭</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-gray-500">보유 기간</span>
                <span className="text-gray-900">회원 탈퇴 시 즉시 파기</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <button 
              onClick={() => handleSocialLogin('kakao')} 
              className="w-full h-16 bg-[#FEE500] text-[#191919] rounded-2xl flex items-center justify-center gap-3 font-black transition-all shadow-lg active:scale-95 hover:bg-[#F7E317]"
            >
              {loading === 'kakao' ? (
                <div className="animate-spin border-2 border-[#191919]/20 border-t-[#191919] w-5 h-5 rounded-full"></div>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.477 3 2 6.48 2 10.791c0 2.758 1.83 5.161 4.587 6.556l-1.159 4.255c-.07.258.21.464.415.303l5.013-3.292c.376.041.76.069 1.144.069 5.523 0 10-3.48 10-7.791S17.523 3 12 3z"/></svg>
                  카카오로 시작하기
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={agreed} 
                onChange={e => setAgreed(e.target.checked)}
                className="w-5 h-5 accent-amber-700"
              />
              <span className="text-[11px] font-bold text-gray-500 leading-tight">
                [필수] <Link to="/terms" className="underline hover:text-gray-900">이용약관</Link> 및 <Link to="/privacy" className="underline hover:text-gray-900">개인정보 처리방침</Link> 동의
              </span>
            </label>
          </div>
          
          <div className="mt-10 pt-6 border-t border-gray-50 text-center">
            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em]">Pet Sitter Standard</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;