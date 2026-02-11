import React, { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    try {
      localStorage.setItem('social_provider', 'kakao');
      
      const res = await fetch('/api/auth/social');
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('로그인 URL을 받지 못했습니다');
      }
    } catch (e) {
      console.error('Kakao login error:', e);
      alert("로그인 페이지를 불러올 수 없습니다.");
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.25)] p-8 md:p-12 w-full max-w-md animate-in zoom-in-95 duration-300">
        {/* 닫기 버튼 */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          disabled={isLoading}
        >
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🐾</div>
          <h2 className="text-2xl md:text-3xl font-[1000] text-gray-900 tracking-tight mb-3">
            펫시터의 정석
          </h2>
          <p className="text-gray-500 font-bold text-sm">
            3초만에 시작하기
          </p>
        </div>

        {/* 카카오 로그인 버튼 */}
        <button
          onClick={handleKakaoLogin}
          disabled={isLoading}
          className="w-full bg-[#FEE500] hover:bg-[#FDD835] text-[#191919] py-5 rounded-2xl font-[1000] text-base shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-3 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3C6.477 3 2 6.48 2 10.791c0 2.758 1.83 5.161 4.587 6.556l-1.159 4.255c-.07.258.21.464.415.303l5.013-3.292c.376.041.76.069 1.144.069 5.523 0 10-3.48 10-7.791S17.523 3 12 3z"/>
              </svg>
              <span>카카오로 3초만에 시작하기</span>
            </>
          )}
        </button>

        {/* 안내 문구 */}
        <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
          로그인 시 <span className="text-gray-600 font-bold">이용약관</span> 및 <span className="text-gray-600 font-bold">개인정보처리방침</span>에 동의하게 됩니다.
        </p>

        {/* 카카오 심사용 수집 항목 고지 */}
        <div className="mt-6 p-4 bg-amber-50/50 rounded-xl border border-amber-100">
          <p className="text-[10px] text-gray-500 leading-relaxed">
            <span className="font-black text-amber-700">수집 항목:</span> 프로필 정보(닉네임, 프로필 사진)
            <br/>
            <span className="font-black text-amber-700">수집 목적:</span> 서비스 이용자 식별 및 후기 작성
            <br/>
            <span className="font-black text-amber-700">보유 기간:</span> 회원 탈퇴 시까지
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;