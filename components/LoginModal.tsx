const handleSocialLogin = () => {
    // 🚨 fetch('/api/auth/social') 이런 거 절대 쓰지 마세요!
    // 서버 주소를 그냥 '주소창'에 입력하는 것과 똑같은 효과를 줍니다.
    // 그러면 서버가 위의 302 명령을 내려서 카카오로 보내줍니다.
    
    window.location.href = '/api/auth/social';
  };
