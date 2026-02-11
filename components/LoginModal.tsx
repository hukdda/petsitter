const handleKakaoLogin = async () => {
  try {
    const res = await fetch('/api/auth/social');
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url; // 카카오 로그인 페이지로 이동
    }
  } catch (e) {
    alert("로그인 페이지를 불러올 수 없습니다.");
  }
};
