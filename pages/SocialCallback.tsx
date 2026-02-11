import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface SocialCallbackProps {
  onLoginSuccess: (user: any) => void;
}

const SocialCallback: React.FC<SocialCallbackProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (processed.current) return;
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        processed.current = true;
        try {
          // 🚨 사장님이 만든 서버 API로 직접 전달합니다!
          // 주소창의 code를 그대로 서버에 배달하는 과정입니다.
          const response = await fetch(`/api/auth/social?code=${code}`);
          const data = await response.json();

          if (data.success) {
            // 로그인 성공! 유저 정보를 저장하고 메인으로 보냅니다.
            onLoginSuccess(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/', { replace: true });
          } else {
            throw new Error(data.error || '로그인 실패');
          }
        } catch (error: any) {
          console.error('Login Error:', error);
          alert(`로그인 처리 중 오류: ${error.message}`);
          navigate('/');
        }
      } else {
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, onLoginSuccess]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      <div className="animate-spin mb-6 w-10 h-10 border-4 border-amber-700 border-t-transparent rounded-full"></div>
      <h2 className="text-lg font-black text-gray-900 tracking-tight">로그인 완료 중</h2>
      <p className="text-gray-400 mt-2 font-bold text-xs">잠시만 기다려 주세요.</p>
    </div>
  );
};

export default SocialCallback;
