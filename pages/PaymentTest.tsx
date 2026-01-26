
import React, { useState, useEffect } from 'react';

const PaymentTest: React.FC = () => {
  const [sdkInfo, setSdkInfo] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [testAmount, setTestAmount] = useState('100');

  const addLog = (msg: string) => {
    setLogs(prev => [new Date().toLocaleTimeString() + ': ' + msg, ...prev]);
  };

  useEffect(() => {
    const checkSDK = () => {
      const win = window as any;
      const nex = win.NexPay || win.nexpay || win.NEXPAY || win.MagNexPay;
      
      if (nex) {
        setSdkInfo({
          name: win.NexPay ? 'NexPay' : win.nexpay ? 'nexpay' : (win.MagNexPay ? 'MagNexPay' : 'Unknown'),
          methods: Object.keys(nex).filter(k => typeof nex[k] === 'function'),
          source: win.__NEXPAY_DIAG?.source || 'EXTERNAL'
        });
      }
    };

    const timer = setInterval(checkSDK, 1000);
    return () => clearInterval(timer);
  }, []);

  const runTest = () => {
    const win = window as any;
    const nex = win.NexPay || win.nexpay || win.NEXPAY || win.MagNexPay;
    
    if (!nex) return alert('SDK가 로드되지 않았습니다.');

    addLog('결제 시도 시작...');
    
    const params = {
      USERID: "DA77436573",
      KEY: "AIyW5KfZL0TDU)sH",
      PAYMETHOD: "CARD",
      TYPE: "P",
      ORDERNO: "TEST_" + Date.now(),
      AMOUNT: testAmount,
      PRODUCTNAME: "결제 테스트용 100원",
      RETURNURL: window.location.origin + "/payment/callback",
      FAILURL: window.location.href
    };

    // 자동 함수 감지 호출
    const payFn = nex.pay || nex.request_pay || nex.pay_request || nex.open;
    
    if (typeof payFn === 'function') {
      addLog(`사용 가능한 함수 감지됨: ${payFn.name || 'Anonymous'}`);
      try {
        payFn.call(nex, params);
        addLog('SDK 함수 호출 성공');
      } catch (e: any) {
        addLog('SDK 호출 중 에러: ' + e.message);
      }
    } else {
      addLog('❌ 호출 가능한 함수를 찾을 수 없습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">SDK 정밀 진단 도구</h1>
          <p className="text-gray-500 font-bold mt-2">결제 엔진의 모든 기능을 테스트합니다.</p>
        </header>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
          <h2 className="text-sm font-black text-amber-700 uppercase tracking-widest mb-6">Engine Status</h2>
          {sdkInfo ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-gray-400 font-bold text-xs">엔진 객체명</span>
                <span className="text-gray-900 font-black">{sdkInfo.name}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-50">
                <span className="text-gray-400 font-bold text-xs">로딩 소스</span>
                <span className="text-blue-600 font-black text-xs">{sdkInfo.source}</span>
              </div>
              <div className="py-3">
                <span className="text-gray-400 font-bold text-xs block mb-2">사용 가능 함수</span>
                <div className="flex flex-wrap gap-2">
                  {sdkInfo.methods.map((m: string) => (
                    <span key={m} className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-full border border-amber-100">
                      {m}()
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center animate-pulse">
              <div className="spinner mx-auto mb-4 border-t-amber-700"></div>
              <p className="text-gray-400 text-xs font-black">엔진을 찾는 중...</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 p-8 rounded-[2rem] shadow-xl">
             <label className="block text-white/50 text-[10px] font-black uppercase mb-2">Test Amount</label>
             <input 
              type="number" 
              value={testAmount} 
              onChange={e => setTestAmount(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black text-2xl outline-none focus:border-amber-500"
             />
             <button 
              onClick={runTest}
              className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white py-5 rounded-2xl font-black shadow-lg transition-all active:scale-95"
             >
               테스트 결제 실행
             </button>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col h-[300px]">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Live Diagnostic Logs</h3>
            <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-2 no-scrollbar">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2 text-gray-600">
                  <span className="text-amber-500 font-black">&gt;</span>
                  <span className="break-all">{log}</span>
                </div>
              ))}
              {logs.length === 0 && <p className="text-gray-300 italic">No activity yet...</p>}
            </div>
          </div>
        </div>

        <footer className="text-center pt-8">
           <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
             * 테스트 결제는 실제 금액이 승인되나, 당일 취소가 가능합니다.<br/>
             * DNS 장애 시 Admin 페이지에서 'nexpay.js' 코드를 패치해 주세요.
           </p>
        </footer>
      </div>
    </div>
  );
};

export default PaymentTest;
