import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { CommentData } from '../types';
import { REGIONS } from '../constants';

interface HomeProps {
  user: any;
}

const carePhotos = [
  { src: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800', alt: '고양이 돌봄' },
  { src: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800', alt: '강아지 산책' },
  { src: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800', alt: '펫 돌봄' },
  { src: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800', alt: '반려동물' }
];

const faqData = [
  { 
    q: '💰 서비스 가격은 어떻게 되나요?', 
    a: '방문 돌봄 30분 18,000원 / 60분 25,000원 / 90분 33,000원 / 120분 40,000원 / 강아지 목욕 50,000원입니다. 하루 2회 방문 시 기본 가격 × 2배가 적용됩니다.' 
  },
  { 
    q: '📅 예약은 어떻게 하나요?', 
    a: '카카오톡으로 로그인 후 "돌봄 비용 알아보기" 메뉴에서 원하시는 서비스와 날짜를 선택하신 후 예약금을 입금하시면 접수가 완료됩니다.' 
  },
  { 
    q: '🐾 어떤 펫시터가 방문하나요?', 
    a: '모든 펫시터는 반려동물 양육 경험, 범죄 경력 조회, 교육 이수를 거친 검증된 분들입니다. 거주지 근처의 적합한 시터를 매칭해 드립니다.' 
  },
  { 
    q: '📸 돌봄 중 어떤 서비스를 받나요?', 
    a: '방문 시 사진과 메시지로 실시간 현황을 전달해 드립니다. 밥/물 급여, 화장실 청소, 놀이, 빗질 등 기본 돌봄이 포함됩니다.' 
  },
  { 
    q: '💳 결제 수단은 무엇인가요?', 
    a: '현재는 무통장 입금만 가능합니다. 입금 확인 후 담당자가 개별 연락드립니다.' 
  },
  { 
    q: '🔄 취소 및 환불 규정은?', 
    a: '서비스 시작 3일 전까지 전액 환불, 2일 전 50% 환불, 1일 전 및 당일 환불 불가입니다.' 
  }
];

const Home: React.FC<HomeProps> = ({ user }) => {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('서울');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    api.fetchComments().then(data => {
      if (Array.isArray(data)) setComments(data);
    });
  }, []);

  const handleCommentSubmit = async () => {
    if (!user) return alert('로그인 후 이용 가능합니다.');
    if (!newComment.trim()) return alert('후기 내용을 입력해 주세요');
    
    setIsSubmitting(true);
    try {
      const response = await api.submitComment({
        author: user.name,
        region: selectedRegion,
        content: newComment
      });
      if (response.success) {
        setComments(prev => [response.data, ...prev]);
        setNewComment('');
        alert('소중한 후기가 등록되었습니다!');
      }
    } catch (error) {
      alert('후기 등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-orange-50 pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.15),transparent_50%),radial-gradient(circle_at_70%_60%,rgba(249,115,22,0.1),transparent_50%)]"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-10">
            <div className="inline-block bg-amber-100 text-amber-900 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.3em] mb-4 shadow-sm">
              Premium Pet Care Service
            </div>
            
            <h1 className="text-4xl md:text-7xl font-[1000] tracking-tighter leading-[1.1] text-gray-900 mb-8">
              내 집보다<br />
              편안한 곳은 없습니다
            </h1>
            
            <p className="text-lg md:text-2xl text-gray-600 font-bold max-w-3xl mx-auto leading-relaxed mb-12">
              익숙한 공간에서 만나는<br className="md:hidden" /> 품격 있는 반려동물 방문 돌봄
            </p>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-5 mt-12">
              <Link to="/calculator" className="group bg-amber-700 text-white px-10 py-6 rounded-[2.5rem] text-lg font-black shadow-2xl hover:bg-amber-800 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                <span>지금 바로 예약하기</span>
                <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              
              <a href="#reviews" className="border-2 border-gray-200 text-gray-700 px-10 py-6 rounded-[2.5rem] text-lg font-black hover:border-gray-900 hover:text-gray-900 transition-all">
                후기 먼저 보기
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <div className="inline-block bg-amber-50 text-amber-800 px-4 py-1.5 rounded-full text-[10px] font-black mb-6 tracking-widest uppercase">Our Services</div>
            <h2 className="text-2xl md:text-4xl font-black mb-4 tracking-tight">프리미엄 돌봄 서비스</h2>
            <p className="text-gray-500 font-bold">집에서 편안하게, 전문가의 손길로</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: '🏠', title: '방문 돌봄 30분', price: '18,000원', desc: '간단한 급식과 놀이' },
              { icon: '⏰', title: '방문 돌봄 60분', price: '25,000원', desc: '충분한 케어와 교감' },
              { icon: '⏳', title: '방문 돌봄 90분', price: '33,000원', desc: '여유로운 돌봄 시간' },
              { icon: '🕐', title: '방문 돌봄 120분', price: '40,000원', desc: '장시간 집중 케어' },
              { icon: '🛁', title: '강아지 목욕', price: '50,000원', desc: '전문 목욕 서비스' }
            ].map((service, i) => (
              <div key={i} className="bg-gradient-to-br from-amber-50 to-orange-50 p-10 rounded-[3rem] border border-amber-100/50 hover:shadow-2xl transition-all group">
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">{service.icon}</div>
                <h3 className="text-xl font-black mb-3 text-gray-900">{service.title}</h3>
                <div className="text-3xl font-[1000] text-amber-700 mb-4">{service.price}</div>
                <p className="text-gray-600 text-sm font-bold">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section id="trust" className="py-20 md:py-32 bg-[#fafafa]">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-block bg-amber-50 text-amber-800 px-4 py-1.5 rounded-full text-[10px] font-black mb-6 tracking-widest uppercase">Expertise & Safety</div>
          <h2 className="text-2xl md:text-4xl font-black mb-16 tracking-tight">펫시터의 정석은 다릅니다</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { title: '체계적인 심사 관리', desc: '시터 경력과 반려동물 경험 상세 확인', icon: '✅' },
              { title: '지역 기반 매칭', desc: '거주지 근처의 적합한 시터 연결', icon: '🗺️' },
              { title: '돌봄 기간 기록', desc: '사진과 메시지로 전달되는 우리 아이 소식', icon: '📷' },
              { title: '진실된 후기 시스템', desc: '과장 없는 실제 이용자들의 솔직한 평가', icon: '⭐' }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 group shadow-sm hover:shadow-xl transition-all">
                <div className="text-5xl md:text-6xl mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="text-lg md:text-xl font-black mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center justify-between mb-12 px-2">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
              ⭐ 보호자 리얼 후기 <span className="text-amber-500">⭐</span>
            </h2>
            <div className="text-[10px] font-black text-red-500 bg-red-50 px-3 py-1.5 rounded-full">실제 사용자 인증</div>
          </div>

          <div className="mb-12 bg-gray-50 p-8 rounded-[3rem] border border-gray-100 shadow-inner">
            {user ? (
              <div className="space-y-5 text-left">
                <div className="flex justify-between items-center px-1">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">돌봄 지역 선택</label>
                    <select 
                      value={selectedRegion} 
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="bg-white border-2 border-amber-100 rounded-2xl px-4 py-2 text-xs font-black text-amber-900 focus:border-amber-700 outline-none shadow-sm"
                    >
                      {REGIONS.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-gray-400">작성자</span>
                    <div className="text-sm font-black text-amber-800">{user.name} 님</div>
                  </div>
                </div>
                <textarea 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="아이와 함께한 소중한 돌봄 기간을 기록해 주세요"
                  className="w-full h-28 p-6 bg-white border-none rounded-[2rem] text-sm focus:ring-4 focus:ring-amber-700/5 outline-none resize-none font-medium shadow-sm"
                />
                <button 
                  onClick={handleCommentSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-amber-700 text-white py-5 rounded-[2rem] font-black text-base shadow-xl hover:bg-amber-800 active:scale-95 transition-all"
                >
                  리얼 후기 등록하기
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400 text-sm font-bold mb-4">로그인하시면 돌봄 후기를 직접 작성하실 수 있습니다.</p>
                <button 
                  onClick={() => window.dispatchEvent(new Event('OPEN_LOGIN'))}
                  className="text-amber-700 text-xs font-black underline underline-offset-4 hover:text-amber-900"
                >
                  간편 로그인하고 후기 남기기
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow text-left">
                  <div className="flex items-center gap-5 mb-6">
                    <img src={comment.profileImg} alt="Sitter" className="w-12 h-12 rounded-full bg-amber-50 shadow-sm" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-gray-900 text-sm md:text-base">{comment.sitterName || '전문 시터님'}</span>
                        <span className="text-[10px] text-gray-300 font-bold tracking-tighter">{comment.relativeTime || '방금 전'}</span>
                      </div>
                      <div className="text-[10px] md:text-xs text-amber-700 font-black mt-1">{comment.region} · {comment.serviceType || '방문 돌봄'}</div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-amber-400 text-xs mb-4">★★★★★</div>
                  <p className="text-[14px] md:text-base text-gray-700 font-medium leading-[1.8] mb-8 whitespace-pre-line">
                    {comment.content}
                  </p>
                  <div className="flex justify-between items-center pt-6 border-t border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>보호자 {comment.author}</span>
                    <span className="text-amber-600/30 italic">#PetSitterStandard</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                <p className="text-gray-400 text-sm font-bold">첫번째 돌봄 후기를 남겨주세요!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Actual Care Photos */}
      <section className="py-20 md:py-32 bg-[#fafafa]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-12 flex items-center justify-center gap-4">
            실제 돌봄 현장 사진 <div className="w-16 h-1 bg-amber-400 rounded-full"></div>
          </h2>
          
          <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-5 pb-8 no-scrollbar px-2">
            {carePhotos.map((photo, i) => (
              <div key={i} className="min-w-[280px] md:min-w-0 aspect-square rounded-[3rem] overflow-hidden shadow-xl group border-4 border-white">
                <img 
                  src={photo.src} 
                  alt={photo.alt} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-[10px] md:text-xs font-bold mt-4 italic">
            * 시터분들이 돌봄 중 보호자님께 실제 전송한 사진입니다
          </p>
        </div>
      </section>

      {/* FAQ & Pricing Section */}
      <section id="faq" className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter uppercase">FAQ & 가격 안내</h2>
            <p className="text-gray-400 font-bold text-sm md:text-lg">서비스 가격 및 이용 규정을 확인해 보세요</p>
          </div>
          
          <div className="space-y-5 text-left">
            {faqData.map((faq, index) => (
              <div key={index} className="border border-gray-100 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden transition-all shadow-sm hover:shadow-md">
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex justify-between items-center p-8 md:p-10 text-left bg-white hover:bg-gray-50/50 transition-colors"
                >
                  <span className="font-black text-gray-900 text-base md:text-xl pr-6">{faq.q}</span>
                  <span className={`text-2xl md:text-3xl text-amber-700 transition-transform duration-300 ${openFaq === index ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === index && (
                  <div className="px-8 pb-10 md:px-10 md:pb-12 text-gray-500 font-medium leading-relaxed text-sm md:text-base animate-in fade-in slide-in-from-top-2">
                    {faq.a}
                  </div>
                )}
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