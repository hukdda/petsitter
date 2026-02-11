const handleSocialLogin = async () => {
    try {
      // 1. 서버에 로그인 요청을 보냅니다.
      const response = await fetch('/api/auth/social');
      
      // 2. 서버가 준 데이터(사장님이 보신 그 내용)를 받습니다.
      const data = await response.json();

      // 3. 서버가 알려준 URL로 화면을 이동시킵니다.
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("로그인 이동 중 오류:", error);
      // 혹시라도 서버 응답이 없으면 직접 카카오로 이동 (비상용)
      window.location.href = "https://kauth.kakao.com/oauth/authorize?client_id=4e82f00882c1c24d0b83c1e001adce2f&redirect_uri=https%3A%2F%2Fwww.lovelypetsitter.com%2Fcallback&response_type=code";
    }
  };
