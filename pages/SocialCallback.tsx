import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SocialCallback = ({ onLoginSuccess }: any) => {
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    const login = async () => {
      if (processed.current) return;
      const code = new URLSearchParams(window.location.search).get('code');

      if (code) {
        processed.current = true;
        try {
          // 서버 API에 코드를 던져서 진짜 유저 정보를 받아옴
          const res = await fetch(`/api/auth/social?code=${code}`);
          const data = await res.json();

          if (data.success) {
            // 진짜 닉네임을 로컬 스토리지에 저장!
            localStorage.setItem('user', JSON.stringify(data.user));
            if (onLoginSuccess) onLoginSuccess(data.user);
            navigate('/', { replace: true });
          } else {
            alert("로그인 실패: " + data.error);
            navigate('/');
          }
        } catch (e) {
          alert("서버 연결 오류");
          navigate('/');
        }
      }
    };
    login();
  }, [navigate, onLoginSuccess]);

  return <div>로그인 중...</div>;
};

export default SocialCallback;
