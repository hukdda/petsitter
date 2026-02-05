import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface SocialCallbackProps {
  onLoginSuccess: (user: any) => void;
}

const SocialCallback: React.FC<SocialCallbackProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      // 1. 중복 실행 방지 (React StrictMode 대응)
      if (processed.current) return;
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      
      // 카카오 설정(image_b269a2.png)에 등록하신 주소와 정확히 일치시켜야 합니다.
      const provider = 'kakao'; 
      const redirectUri = `${window.location.origin}/callback`; 

      if (error) {
        console.error('카카오 인증 에러:', error);
        navigate('/');
        return;
      }

      if (code) {
        processed.current = true;
        try {
          // 2. 백엔드 서버(/api/auth/social)로 인가 코드 전달
          // api.socialLogin 함수가 내부적으로 POST /api/auth/social 을 호출하는지 확인 필요!
          const res = await api.socialLogin(provider, code, redirectUri);
          
          if (res.success) {
            onLoginSuccess(res.user);
            localStorage.setItem('user', JSON.stringify(res.user));
            // 로그인 성공 시 메인으로 이동
            navigate('/', { replace: true });
          } else {
            throw new Error(res.message || '로그인 처리 실패');
          }
        } catch (error: any) {
          console.error('서버 통신 에리:', error);
          alert(`로그인 중 오류가 발생했습니다: ${error.message}`);
          navigate('/');
        }
      } else {
        // 코드가 없으면 메인으로 리다이렉트
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, onLoginSuccess]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
      {/* 로딩 스피너 애니메이션 추가 */}
      <div className="w-12 h-12 border-4 border-amber-100 border-t-amber-600 rounded-full animate-spin mb-6"></div>
      <h2 className="text-xl font-bold text-gray-900 tracking-tight">안전하게 로그인 중입니다</h2>
      <p className="text-gray-500 mt-2 font-medium">잠시만 기다려 주세요.</p>
    </div>
  );
};

export default SocialCallback;