import React, { useState } from 'react';

const LoginModal = ({ isOpen, onClose }: any) => {
  if (!isOpen) return null;

  const handleSocialLogin = () => {
    // 🚨 여기서 서버(/api/auth/social)를 절대로 먼저 부르면 안 됩니다!
    // 1. 카카오 로그인 화면으로 먼저 보냅니다.
    const KAKAO_CLIENT_ID = "4e82f00882c1c24d0b83c1e001adce2f";
    const REDIRECT_URI = "https://www.lovelypetsitter.com/callback";
    
    // 카카오가 우리 사이트로 돌아올 때 'code'를 들고 오게 만드는 마법의 주소입니다.
    const kakaoUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code`;
    
    // 2. 바로 이동시킵니다. (여기서 에러가 날 확률은 0%입니다)
    window.location.href = kakaoUrl;
  };

  return (
    <div style={{position:'fixed', inset:0, zIndex:9999, backgroundColor:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', alignItems:'center'}}>
      <div style={{backgroundColor:'white', padding:'40px', borderRadius:'30px', textAlign:'center', maxWidth:'320px', width:'100%'}}>
        <div style={{fontSize:'40px', marginBottom:'20px'}}>🐾</div>
        <h3 style={{fontWeight:'bold', fontSize:'22px', marginBottom:'10px'}}>로그인</h3>
        <p style={{fontSize:'13px', color:'#999', marginBottom:'30px'}}>카카오로 안전하게 시작하세요.</p>
        
        <button 
          onClick={handleSocialLogin}
          style={{width:'100%', height:'55px', backgroundColor:'#FEE500', border:'none', borderRadius:'12px', fontWeight:'bold', fontSize:'16px', cursor:'pointer'}}
        >
          카카오 로그인
        </button>

        <button onClick={onClose} style={{marginTop:'20px', background:'none', border:'none', color:'#ccc', cursor:'pointer', textDecoration:'underline'}}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
