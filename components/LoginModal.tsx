import React from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleSocialLogin = () => {
    // 🚨 fetch를 쓰지 않고 브라우저 주소를 직접 바꿉니다. 
    // 이러면 'Failed to fetch' 에러가 절대 날 수 없습니다.
    window.location.href = 'https://www.lovelypetsitter.com/api/auth/social';
  };

  return (
    <div style={{position:'fixed', inset:0, zIndex:9999, backgroundColor:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', alignItems:'center', padding:'20px'}}>
      <div style={{backgroundColor:'white', width:'100%', maxWidth:'350px', padding:'40px', borderRadius:'30px', textAlign:'center', boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)'}}>
        <div style={{fontSize:'40px', marginBottom:'20px'}}>🐾</div>
        <h3 style={{fontSize:'22px', fontWeight:'900', color:'#111', marginBottom:'10px'}}>간편 로그인</h3>
        <p style={{fontSize:'14px', color:'#666', marginBottom:'30px'}}>카카오로 3초 만에 가입하고<br/>우리 동네 시터를 만나보세요!</p>
        
        <button 
          onClick={handleSocialLogin}
          style={{width:'100%', height:'60px', backgroundColor:'#FEE500', color:'#191919', border:'none', borderRadius:'15px', fontWeight:'800', fontSize:'16px', cursor:'pointer', boxShadow:'0 4px 6px -1px rgba(0,0,0,0.1)'}}
        >
          카카오로 시작하기
        </button>

        <button 
          onClick={onClose}
          style={{marginTop:'25px', background:'none', border:'none', color:'#999', fontSize:'14px', textDecoration:'underline', cursor:'pointer'}}
        >
          나중에 할게요
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
