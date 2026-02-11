const handleSocialLogin = async () => {
    try {
      // 1. 서버에 로그인 티켓(URL)을 요청합니다.
      const response = await fetch('/api/auth/social');
      const data = await response.json();

      // 2. 서버가 준 주소(data.url)가 있으면 즉시 이동합니다!
      if (data.url) {
        window.location.href = data.url;
      } else {
        // 혹시 모르니 서버 응답이 이상하면 바로 카카오로 보냅니다.
        throw new Error("No URL found");
      }
    } catch (error) {
      console.log("자동 이동 시도 중...");
      // 🚨 서버 응답이 늦거나 에러나면 직접 카카오로 던져버립니다.
      const clientId = "4e82f00882c1c24d0b83c1e001adce2f";
      const redirectUri = "https://www.lovelypetsitter.com/callback";
      window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    }
  };
