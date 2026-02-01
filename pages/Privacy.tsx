
import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="py-16 md:py-24 bg-[#fdfaf5] min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-[3rem] shadow-xl border border-amber-100 p-8 md:p-16">
          <header className="mb-12 border-b border-amber-50 pb-8">
            <div className="inline-block bg-gray-900 text-white px-4 py-1 rounded-full text-[10px] font-black mb-4 tracking-widest uppercase">Privacy Policy</div>
            <h1 className="text-3xl md:text-4xl font-[950] text-gray-900 tracking-tight">개인정보 처리방침</h1>
            <p className="text-gray-400 font-bold mt-2 text-sm italic">최종 수정일: 2025년 2월 24일</p>
          </header>

          <div className="space-y-12 text-gray-600 leading-[1.8] font-medium text-sm md:text-base">
            <section className="space-y-6">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                1. 개인정보 수집 항목 및 이용 목적
              </h2>
              <p className="text-sm">회사는 서비스 제공 및 펫시터 자격 검증을 위해 아래와 같이 개인정보를 수집하고 있습니다. 수집된 정보는 목적 이외의 용도로는 이용되지 않습니다.</p>
              
              <div className="overflow-hidden border border-gray-100 rounded-2xl shadow-sm">
                <table className="w-full text-left text-[11px] md:text-xs border-collapse">
                  <thead className="bg-gray-50 font-black text-gray-700">
                    <tr>
                      <th className="p-3 border-b">구분</th>
                      <th className="p-3 border-b">수집 항목 (카카오 싱크 포함)</th>
                      <th className="p-3 border-b">이용 목적</th>
                      <th className="p-3 border-b">설정</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <tr>
                      <td className="p-3 font-bold">공통</td>
                      <td className="p-3">이름(닉네임), 프로필 이미지</td>
                      <td className="p-3">서비스 이용자 식별</td>
                      <td className="p-3 text-amber-700 font-black">필수</td>
                    </tr>
                    <tr className="bg-amber-50/10">
                      <td className="p-3 font-bold" rowSpan={3}>전문가 지원자<br/>(펫시터)</td>
                      <td className="p-3">전화번호, 연령대, 출생 연도</td>
                      <td className="p-3">지원자 본인 확인 및 자격 검증</td>
                      <td className="p-3 text-amber-700 font-black">필수</td>
                    </tr>
                    <tr className="bg-amber-50/10">
                      <td className="p-3">성별</td>
                      <td className="p-3">서비스 적합성 판단 및 통계 분석</td>
                      <td className="p-3 text-gray-400 font-bold">선택</td>
                    </tr>
                    <tr className="bg-amber-50/10">
                      <td className="p-3">거주 주소, 경력사항, 전자서명</td>
                      <td className="p-3">펫시터 매칭 및 신원 증빙</td>
                      <td className="p-3 text-amber-700 font-black">필수</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold">보호자</td>
                      <td className="p-3">연락처, 방문 주소, 반려동물 정보</td>
                      <td className="p-3">돌봄 서비스 예약 및 수행</td>
                      <td className="p-3 text-amber-700 font-black">필수</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-gray-400 font-bold">* 카카오 로그인(카카오 싱크) 시 수집되는 연령대, 출생 연도, 성별 항목은 전문가 지원 시 본인 인증 보조 수단으로만 활용되며, 일반 이용자의 경우 필수적으로 수집하지 않습니다.</p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                2. 개인정보의 보유 및 이용 기간
              </h2>
              <ul className="list-disc pl-5 space-y-1 text-xs text-gray-500 italic">
                <li>계약 및 결제 등에 관한 기록: 5년</li>
                <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
                <li>전문가 지원 데이터: 지원 결과 통보 후 1년</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                3. 개인정보 보호 책임자
              </h2>
              <p>이메일: daegupetsit@naver.com / 연락처: 0507-1344-6573</p>
            </section>
          </div>

          <div className="mt-16 pt-12 border-t border-gray-100 text-center">
            <button onClick={() => window.history.back()} className="bg-amber-700 text-white px-10 py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all">이전 페이지로 돌아가기</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
