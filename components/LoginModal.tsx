const handleSocialLogin = async () => {
    try {
      // 🚨 서버에게 어디로 갈지 물어봅니다.
      const response = await fetch('/api/auth/social');
      const data = await response.json();

      if (data.needRedirect) {
        // 🚨 브라우저가 직접 이동하게 함으로써 CORS 에러를 회피합니다.
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("로그인 시도 중 에러:", error);
      // 혹시라도 에러나면 바로 카카오로 직접 쏘는 안전장치
      const clientId = "4e82f00882c1c24d0b83c1e001adce2f";
      const redirectUri = "https://www.lovelypetsitter.com/callback";
      window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    }
  };
