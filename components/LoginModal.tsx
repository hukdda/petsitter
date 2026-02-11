import React from 'react';

const LoginModalNew = ({ isOpen, onClose }: any) => {
  if (!isOpen) return null;

  const handleKakaoLogin = () => {
    // 🚨 복잡한 서버 호출 다 지웠습니다. 오직 "카카오 이동"만 합니다.
    const clientId = "4e82f00882c1c24d0b83c1e001adce2f";
    const redirectUri = "https://www.lovelypetsitter.com/callback";
    
    // 카카오 로그인창으로 직접 날려버리는 주소
    const kakaoUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    
    console.log("카카오로 이동합니다!");
    window.location.href = kakaoUrl;
  };

  return (
    <div style={{position:'fixed', inset:0, zIndex:9999, backgroundColor:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', alignItems:'center'}}>
      <div style={{backgroundColor:'white', padding:'40px', borderRadius:'30px', textAlign:'center', maxWidth:'350px'}}>
        <h2 style={{fontSize:'24px', fontWeight:'bold', marginBottom:'10px'}}>로그인</h2>
        <p style={{fontSize:'14px', color:'#666', marginBottom:'20px'}}>카카오로 바로 시작하세요</p>
        
        <button 
          onClick={handleKakaoLogin}
          style={{width:'100%', height:'60px', backgroundColor:'#FEE500', border:'none', borderRadius:'15px', fontWeight:'bold', cursor:'pointer'}}
        >
          카카오 로그인
        </button>

        <button onClick={onClose} style={{marginTop:'20px', background:'none', border:'none', color:'#999', cursor:'pointer'}}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default LoginModalNew;
