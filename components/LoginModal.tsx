const handleSocialLogin = async () => {
    try {
      // 1. 서버에게 물어봅니다.
      const response = await fetch('/api/auth/social');
      
      // 2. 서버가 준 저 글자(JSON)를 해석합니다.
      const data = await response.json();

      // 3. 서버가 "이동해!"(needRedirect)라고 하면 그 주소로 보냅니다.
      if (data.needRedirect) {
        window.location.href = data.url;
      } else if (data.success) {
        // 이미 로그인이 되어 있는 경우의 처리
        alert(data.user.name + '님, 환영합니다!');
        window.location.reload();
      }
    } catch (error) {
      console.error("연결 오류:", error);
      // 혹시 서버가 응답을 안 하면 강제로 카카오로 보냅니다 (안전장치)
      window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=4e82f00882c1c24d0b83c1e001adce2f&redirect_uri=https%3A%2F%2Fwww.lovelypetsitter.com%2Fcallback&response_type=code`;
    }
  };
