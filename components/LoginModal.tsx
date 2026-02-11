import React, { useState } from 'react';

const LoginModal = ({ isOpen, onClose }: any) => {
  if (!isOpen) return null;

  const handleKakao = () => {
    // 🚨 딱 3개만 확인: ID, 주소, 그리고 바로 이동!
    const clientId = "4e82f00882c1c24d0b83c1e001adce2f";
    const redirectUri = "https://www.lovelypetsitter.com/callback";
    const kakaoUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    
    // 서버고 뭐고 무조건 카카오로 날아갑니다.
    window.location.href = kakaoUrl;
  };

  return (
    <div style={{position:'fixed', inset:0, zIndex:9999, backgroundColor:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', alignItems:'center'}}>
      <div style={{backgroundColor:'white', padding:'40px', borderRadius:'30px', textAlign:'center', maxWidth:'320px', width:'100%'}}>
        <div style={{fontSize:'40px', marginBottom:'20px'}}>🐾</div>
        <h2 style={{fontWeight:'bold', fontSize:'20px', marginBottom:'10px'}}>간편 로그인</h2>
        <p style={{fontSize:'13px', color:'#666', marginBottom:'30px'}}>카카오로 3초만에 시작하세요!</p>
        
        <button 
          onClick={handleKakao}
          style={{width:'100%', height:'55px', backgroundColor:'#FEE500', border:'none', borderRadius:'12px', fontWeight:'bold', fontSize:'16px', cursor:'pointer'}}
        >
          카카오로 로그인하기
        </button>

        <button onClick={onClose} style={{marginTop:'20px', background:'none', border:'none', color:'#999', textDecoration:'underline', cursor:'pointer'}}>
          닫기
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
