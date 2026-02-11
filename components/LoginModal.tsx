import React from 'react';

const LoginModal = ({ isOpen, onClose }: any) => {
  if (!isOpen) return null;

  const handleSocialLogin = async () => {
    try {
      // 1. 서버에 로그인 주소를 요청합니다.
      const response = await fetch('/api/auth/social');
      const data = await response.json();

      // 2. 서버가 준 데이터(사장님이 보신 저 글자)에서 url을 꺼내 이동시킵니다.
      if (data.url) {
        window.location.href = data.url;
      } else {
        // 혹시 url이 없으면 비상용으로 직접 이동!
        window.location.href = "https://kauth.kakao.com/oauth/authorize?client_id=4e82f00882c1c24d0b83c1e001adce2f&redirect_uri=https%3A%2F%2Fwww.lovelypetsitter.com%2Fcallback&response_type=code";
      }
    } catch (error) {
      console.error("이동 오류:", error);
      // 에러 나면 무조건 카카오로 직접 던집니다.
      window.location.href = "https://kauth.kakao.com/oauth/authorize?client_id=4e82f00882c1c24d0b83c1e001adce2f&redirect_uri=https%3A%2F%2Fwww.lovelypetsitter.com%2Fcallback&response_type=code";
    }
  };

  return (
    <div style={{position:'fixed', inset:0, zIndex:9999, backgroundColor:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', alignItems:'center'}}>
      <div style={{backgroundColor:'white', padding:'40px', borderRadius:'20px', textAlign:'center'}}>
        <h2 style={{marginBottom:'20px'}}>로그인</h2>
        <button 
          onClick={handleSocialLogin}
          style={{padding:'15px 30px', backgroundColor:'#FEE500', border:'none', borderRadius:'10px', fontWeight:'bold', cursor:'pointer'}}
        >
          카카오 로그인
        </button>
        <button onClick={onClose} style={{display:'block', margin:'20px auto 0', background:'none', border:'none', color:'#999', cursor:'pointer'}}>닫기</button>
      </div>
    </div>
  );
};

export default LoginModal;
