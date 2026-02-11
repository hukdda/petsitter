const handleSocialLogin = async (provider: 'kakao') => {
    if (!agreed) {
      alert('이용약관 및 개인정보 처리방침에 동의해 주세요.');
      return;
    }
    
    setLoading(provider);
    
    try {
      // 🚨 중요: 여기서 서버에 접속해서 '어디로 갈지' 물어봅니다.
      const response = await fetch('/api/auth/social');
      const data = await response.json();

      if (data.needRedirect) {
        // 서버가 알려준 카카오 로그인창으로 직접 이동!
        window.location.href = data.url;
        return;
      }

      if (data.success) {
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (error) {
      console.error("Login Error:", error);
      // 사장님 로그에 찍힌 그 에러를 여기서 잡습니다.
    } finally {
      setLoading(null);
    }
  };
