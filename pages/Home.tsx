
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { CommentData } from '../types';

interface HomeProps {
  user: any;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const navigate = useNavigate();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    api.fetchComments().then(data => {
      if (Array.isArray(data)) setComments(data);
    });
  }, []);

  const handleHeroClick = () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('OPEN_LOGIN'));
    } else {
      navigate('/calculator');
    }
  };

  const handleCommentSubmit = async () => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('OPEN_LOGIN'));
      return;
    }
    if (!newComment.trim()) {
      alert('후기 내용을 입력해 주세요.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await api.submitComment({
        author: user.name,
        region: '방문 지역',
        content: newComment
      });
      if (response.success) {
        setComments(prev => [response.data, ...prev]);
        setNewComment('');
      }
    } catch (err) {
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sellingPoints = [
    {
      title: "우리 집에서, 가족처럼",
      desc: "편안하고 사랑 가득한 돌봄",
      icon: "🏠"
    },
    {
      title: "실시간 안심 리포트",
      desc: "사진·영상으로 매 순간 함께",
      icon: "📱"
    },
    {
      title: "진심이 먼저인 시터",
      desc: "동물 사랑 + 꼼꼼 면접 선발",
      icon: "🎖️"
    }
  ];

  const galleryImages = [
    "https://i.imgur.com/5ltFO8W.jpeg",
    "https://i.imgur.com/3aCkvE6.jpeg",
    "https://i.imgur.com/VZMG7qx.jpeg",
    "https://i.imgur.com/wCVYVv4.jpeg"
  ];

  const faqs = [
    { q: "펫시터는 어떤 분들이 오시나요?", a: "엄격한 신원 확인과 1:1 대면 면접을 통과한 검증된 전문가들만 활동합니다. 다년간의 반려 경험을 가진 베테랑들이 방문합니다." },
    { q: "집에 사람이 없어도 서비스가 가능한가요?", a: "네, 가능합니다. 도어락 비밀번호를 안전하게 공유해주시면 서비스 시작부터 끝까지 사진과 영상 보고서를 통해 실시간으로 상황을 전달드립니다." },
    { q: "사고 발생 시 어떻게 대응하나요?", a: "펫시터의 정석은 사고 예방을 위한 철저한 안전 매뉴얼을 준수합니다. 위급 상황 시 즉시 보호자님께 보고하며, 가장 가까운 연계 병원으로 긴급 이송하는 시스템을 갖추고 있습니다." },
    { q: "예약 취소는 언제까지 가능한가요?", a: "서비스 시작 72시간 전까지는 100% 환불이 가능합니다. 이후에는 기간에 따라 차등 환불되므로 이용약관을 확인해 주세요." }
  ];

  return (
    <div className="bg-white overflow-hidden font-sans text-left">
      {/* Hero Section */}
      <section className="relative h-[550px] md:h-[800px] flex items-center overflow-hidden bg-black">
        <img 
          src="https://i.imgur.com/bPTZ1Zv.png" 
          className="absolute inset-0 w-full h-full object-cover z-0 object-center opacity-75" 
          alt="Hero" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent z-10"></div>
        
        <div className="relative z-20 container mx-auto px-6 md:px-20">
          <div className="max-w-2xl animate-in fade-in slide-in-from-left-8 duration-700 ease-out">
            <h2 className="text-amber-500 text-lg md:text-2xl font-[1000] mb-4 md:mb-6 tracking-tight">
              아이도, 마음도 편안하게
            </h2>
            <h1 className="text-[2.8rem] md:text-[5.5rem] font-[1000] text-white leading-[1.1] mb-10 md:mb-14 tracking-[-0.04em]">
              우리 동네<br/>
              검증된 펫시터
            </h1>
            
            <button 
              onClick={handleHeroClick}
              className="bg-[#e67e22] text-white px-12 py-5 md:px-16 md:py-7 rounded-[2rem] md:rounded-[2.5rem] font-[1000] text-lg md:text-xl shadow-2xl hover:bg-[#d35400] transition-all hover:scale-105 active:scale-95"
            >
              돌봄 비용 알아보기
            </button>
          </div>
        </div>
      </section>

      {/* 3 Selling Points Section */}
      <section className="py-24 bg-white relative z-30 -mt-10 md:-mt-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="bg-white rounded-[3rem] md:rounded-[5rem] shadow-[0_60px_120px_rgba(0,0,0,0.08)] p-12 md:p-24 border border-gray-50">
            <div className="text-center mb-16 md:mb-24">
              <h2 className="text-3xl md:text-5xl font-[1000] text-gray-900 tracking-tighter">
                펫시터의 정석은 이렇습니다
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24">
              {sellingPoints.map((point, idx) => (
                <div key={idx} className="flex flex-col items-center md:items-start text-center md:text-left space-y-7 group">
                  <div className="text-6xl md:text-7xl group-hover:scale-110 transition-transform duration-500">{point.icon}</div>
                  <div className="space-y-3">
                    <h3 className="text-2xl md:text-3xl font-[1000] text-gray-900 tracking-tight">{point.title}</h3>
                    <p className="text-gray-500 font-bold leading-relaxed text-base md:text-lg">
                      {point.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Review Section */}
      <section id="reviews" className="py-32 bg-[#fafafa]">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-[1000] tracking-tighter text-gray-900 mb-6 uppercase">User Feedback</h2>
            <p className="text-gray-400 font-bold text-xl">보호자분들이 증명하는 진정성</p>
          </div>
          
          <div className="mb-20 bg-white rounded-[4.5rem] p-12 md:p-16 shadow-[0_40px_100px_rgba(0,0,0,0.05)] border border-amber-50">
            {user ? (
              <div className="flex flex-col gap-10">
                <div className="flex items-center gap-6">
                  <img src={user.profileImg} className="w-20 h-20 rounded-[2rem] shadow-sm" alt="Profile" />
                  <span className="font-[1000] text-gray-900 text-2xl">{user.name} 보호자님</span>
                </div>
                <div className="relative">
                  <textarea 
                    placeholder="아이와의 소중한 경험을 들려주세요."
                    className="w-full bg-gray-50 rounded-[2.5rem] p-10 font-bold text-lg outline-none resize-none focus:ring-4 ring-amber-100 h-44 border border-gray-100"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <button onClick={handleCommentSubmit} disabled={isSubmitting} className="absolute bottom-10 right-10 bg-[#e67e22] text-white px-12 py-5 rounded-[2rem] font-black shadow-2xl hover:bg-[#d35400] transition-all">
                    {isSubmitting ? '전송 중' : '후기 게시'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 font-bold text-xl mb-12 italic">보호자님의 생생한 목소리를 들려주세요.</p>
                <button onClick={() => window.dispatchEvent(new CustomEvent('OPEN_LOGIN'))} className="bg-[#FEE500] text-[#191919] px-16 py-6 rounded-[2.5rem] font-[1000] shadow-2xl flex items-center gap-4 mx-auto text-xl">
                  카카오 로그인하고 작성하기
                </button>
              </div>
            )}
          </div>

          <div className="space-y-12">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-[4rem] p-10 md:p-14 shadow-sm border border-gray-50 flex flex-col md:flex-row gap-10 hover:shadow-xl transition-all">
                <img src={comment.profileImg} className="w-28 h-28 rounded-[2.5rem] bg-gray-50 object-cover" alt="User" />
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-[1000] text-gray-900 text-2xl">{comment.author} 보호자님</span>
                    <span className="text-sm text-gray-400 font-black italic">{comment.relativeTime || '방금 전'}</span>
                  </div>
                  <p className="text-gray-700 font-bold leading-relaxed mb-10 text-xl md:text-2xl italic tracking-tight">"{comment.content}"</p>
                  <div className="flex items-center gap-6 text-xs font-black text-amber-700 uppercase tracking-widest">
                    <span className="bg-gray-50 px-6 py-2 rounded-full border border-gray-100">Sitter: {comment.sitterName}</span>
                    <span className="text-amber-500 text-2xl">★★★★★</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-[1000] text-gray-900 mb-4 tracking-tighter uppercase">Real Moments</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 max-w-7xl mx-auto">
            {galleryImages.map((img, idx) => (
              <div key={idx} className="rounded-[3rem] md:rounded-[4rem] overflow-hidden aspect-[4/5] shadow-2xl">
                <img src={img} className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 hover:scale-110 transition-all duration-[0.8s]" alt={`Case ${idx}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-40 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-[1000] tracking-tighter text-gray-900 mb-8 uppercase">FAQ</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-[#fafafa] rounded-[2.5rem] overflow-hidden border border-gray-50">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-10 py-10 flex items-center justify-between text-left group"
                >
                  <span className={`text-xl md:text-2xl font-black transition-colors ${openFaq === idx ? 'text-amber-600' : 'text-gray-900 group-hover:text-amber-600'}`}>
                    {faq.q}
                  </span>
                  <span className={`text-4xl font-light transition-transform duration-500 ${openFaq === idx ? 'rotate-45 text-amber-600' : 'text-gray-300'}`}>+</span>
                </button>
                <div className={`transition-all duration-500 ease-in-out ${openFaq === idx ? 'max-h-[500px] pb-10 px-10 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="text-gray-500 font-bold text-lg leading-relaxed border-t border-gray-100 pt-8">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="h-48 bg-white"></div>
    </div>
  );
};

export default Home;
