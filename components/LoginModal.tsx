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
    
    // 🚨 [가장 확실한 방법] 서버 거치지 않고 바로 카카오 로그인창으로 보냅니다.
    if (provider === 'kakao') {
      const clientId = "4e82f00882c1c24d0b83c1e001adce2f";
      // 사장님이 카카오에 등록해두신 그 주소 그대로 사용합니다.
      const redirectUri = "https://www.lovelypetsitter.com/callback";
      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`;
      
      window.location.href = kakaoAuthUrl;
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] overflow-y-auto bg-black/80 backdrop-blur-md flex justify-center items-center p-4">
      <div className="relative bg-white w-full max-w-[380px] rounded-[3rem] shadow-2xl p-8 pt-12">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-300 hover:text-gray-900 text-xl">✕</button>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-50 rounded-2xl mb-4"><span className="text-3xl">🐾</span></div>
          <h3 className="text-2xl font-black text-gray-900">간편 회원가입</h3>
        </div>
        <button 
          onClick={() => handleSocialLogin('kakao')} 
          className="w-full h-16 bg-[#FEE500] text-[#191919] rounded-2xl flex items-center justify-center gap-3 font-black shadow-lg"
        >
          {loading === 'kakao' ? "연결 중..." : "카카오로 시작하기"}
        </button>
        <div className="mt-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="w-5 h-5 accent-amber-700" />
            <span className="text-[11px] font-bold text-gray-500 underline">이용약관 및 개인정보 처리방침 동의</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
