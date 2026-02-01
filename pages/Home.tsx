
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { CommentData } from '../types';
import { REGIONS } from '../constants';

interface HomeProps {
  user: any;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('부산');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    // API로부터 후기 목록을 가져옵니다.
    api.fetchComments().then(data => {
      if (Array.isArray(data)) setComments(data);
    });
  }, []);

  const handleCommentSubmit = async () => {
    if (!user) return alert('로그인 후 이용 가능합니다.');
    if (!newComment.trim()) return alert('후기 내용을 입력해 주세요.');
    
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
        alert('소중한 후기가 등록되었습니다.');
      }
    } catch (err) {
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqData = [
    {
      q: "서비스 종류와 요금은 어떻게 되나요?",
      a: (
        <div className="mt-4 overflow-hidden border border-gray-100 rounded-3xl shadow-sm">
          <table className="w-full text-left text-[11px] md:text-sm border-collapse">
            <thead className="bg-amber-700 text-white font-black">
              <tr>
                <th className="p-4">서비스 종류</th>
                <th className="p-4">기본 요금</th>
                <th className="p-4 hidden md:table-cell">주요 서비스 내용</th>
              </tr>
            </thead>
            <tbody className="bg-white font-bold text-gray-700">
              {[
                { name: '방문 돌봄 30분', price: '18,000원', detail: '식사/물 교체, 배변 정리, 실내 놀이' },
                { name: '방문 돌봄 60분', price: '25,000원', detail: '30분 서비스 + 짧은 산책/집중 놀이' },
                { name: '방문 돌봄 90분', price: '32,000원', detail: '60분 서비스 + 긴 산책 및 맞춤 케어' },
                { name: '방문 돌봄 120분', price: '39,000원', detail: '90분 서비스 + 추가 산책/교감' },
                { name: '방문 목욕 (소형견)', price: '50,000원', detail: '목욕, 드라이, 기본 위생 미용' }
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-amber-50/30 transition-colors">
                  <td className="p-4">{row.name}</td>
                  <td className="p-4 text-amber-700">{row.price}</td>
                  <td className="p-4 hidden md:table-cell text-gray-400 font-medium">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    },
    {
      q: "추가 요금이 발생하는 할증 정책이 궁금해요",
      a: (
        <div className="mt-4 overflow-hidden border border-gray-100 rounded-3xl shadow-sm">
          <table className="w-full text-left text-[10px] md:text-xs border-collapse">
            <thead className="bg-amber-50 text-amber-900 font-black">
              <tr>
                <th className="p-4">할증 구분</th>
                <th className="p-4">적용 조건</th>
                <th className="p-4">추가 요금</th>
              </tr>
            </thead>
            <tbody className="bg-white font-bold text-gray-600">
              {[
                { type: '당일 예약', cond: '당일 접수 시', price: '+ 10,000원' },
                { type: '성수기 할증', cond: '5/1~5/5, 7/20~8/15', price: '+ 5,000원' },
                { type: '주말/공휴일', cond: '토, 일 및 법정 공휴일', price: '+ 5,000원' },
                { type: '야간 할증', cond: '20:00 ~ 08:00', price: '+ 5,000원' },
                { type: '명절 할증', cond: '설/추석 본 연휴', price: '+ 10,000원' },
                { type: '다견/다묘', cond: '2마리부터 마리당', price: '+ 5,000원' }
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="p-4">{row.type}</td>
                  <td className="p-4 font-medium">{row.cond}</td>
                  <td className="p-4 text-red-500 font-black">{row.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="p-4 text-[9px] text-gray-400 font-bold bg-gray-50">* 할증이 중복되는 경우 높은 금액 하나가 우선 적용됩니다. (야간/다견/당일 제외)</p>
        </div>
      )
    },
    {
      q: "취소 및 환불 규정은 어떻게 되나요?",
      a: (
        <div className="mt-4 p-6 bg-gray-50 rounded-[2rem] space-y-4 text-[12px] md:text-sm font-bold">
          <div className="flex justify-between items-center text-gray-700 border-b border-gray-200/50 pb-3">
            <span>서비스 시작 72시간 전</span>
            <span className="text-amber-700 font-black">전액 환불 (100%)</span>
          </div>
          <div className="flex justify-between items-center text-gray-700 border-b border-gray-200/50 pb-3">
            <span>서비스 시작 48시간 전</span>
            <span className="text-amber-700">70% 환불</span>
          </div>
          <div className="flex justify-between items-center text-gray-700 border-b border-gray-200/50 pb-3">
            <span>서비스 시작 24시간 전</span>
            <span className="text-amber-700">50% 환불</span>
          </div>
          <div className="flex justify-between items-center text-red-500 font-black pt-1">
            <span>24시간 이내 또는 시작 후</span>
            <span>환불 불가</span>
          </div>
          <p className="text-[10px] text-gray-400 font-medium mt-4 italic leading-relaxed">
            * 시터가 이미 이동 중이거나 예약 당일 노쇼의 경우 환불이 제한될 수 있습니다.
          </p>
        </div>
      )
    }
  ];

  const carePhotos = [
    { src: 'https://i.imgur.com/5ltFO8W.jpeg', alt: '펫시터와 교감 중인 강아지' },
    { src: 'https://i.imgur.com/3aCkvE6.jpeg', alt: '식사 케어 중인 고양이' },
    { src: 'https://i.imgur.com/VZMG7qx.jpeg', alt: '캣타워에서 쉬는 고양이' },
    { src: 'https://i.imgur.com/wCVYVv4.jpeg', alt: '즐거운 밤 산책' }
  ];

  return (
    <div className="bg-white overflow-hidden font-sans pb-24 md:pb-0">
      {/* Hero Section: 모바일 정렬 최적화 */}
      <section className="relative h-[580px] md:h-[800px] flex items-center overflow-hidden bg-[#1a1a1a]">
        <img 
          src="https://i.imgur.com/bPTZ1Zv.png" 
          alt="Premium Pet Sitter" 
          className="absolute inset-0 w-full h-full object-cover z-0 scale-[1.55] md:scale-110 opacity-100 transition-all duration-1000 ease-out object-[72%_25%] md:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 md:via-black/10 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10 md:hidden"></div>
        
        <div className="relative z-20 container mx-auto px-6 md:px-20 flex justify-start">
          <div className="max-w-[300px] md:max-w-2xl text-left">
            <div className="inline-flex items-center gap-1.5 bg-amber-500 text-white px-3.5 py-1 rounded text-[10px] md:text-xs font-black mb-6 shadow-xl animate-in slide-in-from-top-4 duration-500">
              현지 거주 펫시터 1:1 방문 케어
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-[950] text-white leading-[1.2] mb-6 drop-shadow-2xl animate-in slide-in-from-top-6 duration-700">
              우리 동네<br />
              <span className="text-amber-400">안심 방문 돌봄</span>
            </h1>
            
            <p className="text-sm md:text-xl font-bold text-white/95 mb-10 leading-relaxed drop-shadow-md animate-in slide-in-from-top-8 duration-1000">
              현지에 거주하는 검증된 시터가<br className="md:hidden" /> 아이의 일상을 지켜드립니다.
            </p>
            
            <div className="flex justify-start animate-in zoom-in-95 duration-1000 delay-300">
              <Link 
                to="/calculator" 
                className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-10 py-4 md:px-12 md:py-6 rounded-2xl font-black text-base md:text-lg shadow-2xl transition-all active:scale-95"
              >
                지금 바로 예약하기 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section id="trust" className="py-20 md:py-32 bg-[#fafafa]">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-block bg-amber-50 text-amber-800 px-4 py-1.5 rounded-full text-[10px] font-black mb-6 tracking-widest uppercase">Expertise & Safety</div>
          <h2 className="text-2xl md:text-4xl font-black mb-16 tracking-tight">펫시터의 정석은 다릅니다</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            {[
              { title: '철저한 신원확인', desc: '거주지 확인 및 신분증 대조 완료', icon: '🛡️' },
              { title: '대표 직접 면접', desc: '1:1 대면 면접을 통과한 분만 활동', icon: '👥' },
              { title: '실시간 돌봄톡', desc: '돌봄 중 사진과 영상을 실시간 전송', icon: '📱' }
            ].map((item, i) => (
              <div key={i} className="bg-white p-10 md:p-14 rounded-[3rem] border border-gray-100 group shadow-sm hover:shadow-xl transition-all">
                <div className="text-5xl md:text-6xl mb-8 group-hover:scale-110 transition-transform">{item.icon}</div>
                <h3 className="text-xl md:text-2xl font-black mb-4 text-gray-900">{item.title}</h3>
                <p className="text-gray-500 text-sm md:text-base leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section: 보호자 리얼 돌봄톡 */}
      <section id="reviews" className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex items-center justify-between mb-12 px-2">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
               보호자 리얼 후기 <span className="text-amber-500">톡</span>
            </h2>
            <div className="text-[10px] font-black text-red-500 bg-red-50 px-3 py-1.5 rounded-full">실제 사용자 인증</div>
          </div>

          {/* 후기 작성 폼 (로그인 시 노출) */}
          <div className="mb-12 bg-gray-50 p-8 rounded-[3rem] border border-gray-100 shadow-inner">
            {user ? (
              <div className="space-y-5">
                <div className="flex justify-between items-center px-1">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">돌봄 지역 선택</label>
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
                  placeholder="아이와 함께한 소중한 돌봄 시간을 기록해 주세요."
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
                  onClick={() => (document.querySelector('button[onClick*="setIsLoginOpen(true)"]') as HTMLElement | null)?.click()}
                  className="text-amber-700 text-xs font-black underline underline-offset-4 hover:text-amber-900"
                >
                  간편 로그인하고 후기 남기기
                </button>
              </div>
            )}
          </div>

          {/* 후기 목록 */}
          <div className="space-y-6">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-sm hover:shadow-md transition-shadow">
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
                    <span>보호자: {comment.author}</span>
                    <span className="text-amber-600/30 italic">#PetSitterStandard</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                <div className="text-5xl mb-4 grayscale opacity-10">🐾</div>
                <p className="text-gray-400 text-sm font-bold">첫 번째 돌봄 후기를 남겨주세요.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Actual Care Photos Section */}
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
            * 시터님들이 돌봄 중 보호자님께 실제 전송한 사진입니다.
          </p>
        </div>
      </section>

      {/* FAQ Section: 상세 요금표 포함 */}
      <section id="faq" className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter uppercase">FAQ</h2>
            <p className="text-gray-400 font-bold text-sm md:text-lg">서비스 이용에 대해 궁금하신 점을 확인해 보세요.</p>
          </div>
          
          <div className="space-y-5">
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
    </div>
  );
};

export default Home;
