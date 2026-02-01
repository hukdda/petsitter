
import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="py-16 md:py-24 bg-[#fafafa] min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-[3rem] shadow-xl border border-gray-100 p-8 md:p-16">
          <header className="mb-12 border-b border-gray-100 pb-8">
            <div className="inline-block bg-amber-50 text-amber-700 px-4 py-1 rounded-full text-[10px] font-black mb-4 tracking-widest uppercase">Service Policy</div>
            <h1 className="text-3xl md:text-4xl font-[950] text-gray-900 tracking-tight">서비스 이용약관</h1>
            <p className="text-gray-400 font-bold mt-2 text-sm italic">시행일자: 2025년 2월 10일</p>
          </header>

          <div className="space-y-12 text-gray-600 leading-[1.8] font-medium text-sm md:text-base">
            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-amber-700 rounded-full"></span>
                제1조 (목적)
              </h2>
              <p>본 약관은 '펫시터의 정석'(이하 "회사")이 운영하는 플랫폼에서 제공하는 방문 돌봄 및 관련 서비스(이하 "서비스")를 이용함에 있어 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-amber-700 rounded-full"></span>
                제2조 (서비스의 제공)
              </h2>
              <p>회사는 이용자에게 다음과 같은 서비스를 제공합니다.</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-500">
                <li>전문 펫시터 방문 돌봄 서비스 (30분/60분/90분/120분)</li>
                <li>반려동물 방문 목욕 서비스</li>
                <li>실시간 돌봄톡 및 사진/영상 전송 서비스</li>
                <li>예약 및 결제 대행 서비스</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-amber-700 rounded-full"></span>
                제3조 (취소 및 환불)
              </h2>
              <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100">
                <p className="mb-4 font-bold text-amber-900 underline underline-offset-4">서비스 취소 시 다음의 환불 규정이 적용됩니다.</p>
                <ul className="space-y-2 text-xs md:text-sm">
                  <li className="flex justify-between"><span>- 서비스 시작 72시간 전</span> <span className="font-black">전액 환불 (100%)</span></li>
                  <li className="flex justify-between"><span>- 서비스 시작 48시간 전</span> <span className="font-black">70% 환불</span></li>
                  <li className="flex justify-between"><span>- 서비스 시작 24시간 전</span> <span className="font-black">50% 환불</span></li>
                  <li className="flex justify-between text-red-500"><span>- 24시간 이내 또는 시작 후</span> <span className="font-black">환불 불가</span></li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-amber-700 rounded-full"></span>
                제4조 (회사의 책임과 의무)
              </h2>
              <p>회사는 엄격한 신원 확인과 면접을 거친 펫시터를 매칭하기 위해 최선의 노력을 다하며, 돌봄 중 발생하는 사고에 대해 미리 마련된 매뉴얼에 따라 신속히 대응할 의무가 있습니다.</p>
            </section>
          </div>

          <div className="mt-16 pt-12 border-t border-gray-100 text-center">
            <button onClick={() => window.history.back()} className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all">이전 페이지로 돌아가기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
