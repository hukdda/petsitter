
import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';

const Admin: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  
  const [patchCode, setPatchCode] = useState(localStorage.getItem('__NEXPAY_PATCH_CODE') || '');
  
  const [diag, setDiag] = useState<any>({
    sdk: 'checking',
    apiServer: 'checking',
    prodApi: 'checking',
    magTestApi: 'checking',
    latency: 0,
    objName: 'Wait...',
    sdkSource: 'NONE',
    logs: [],
    isMock: false
  });

  const runSystemCheck = async () => {
    const start = Date.now();
    const win = window as any;
    
    let apiStatus = 'fail';
    let prodApi = 'fail';
    let magTestApi = 'fail';
    try {
      const res = await fetch('/api/admin/check-api');
      if (res.ok) {
        const checkData = await res.json();
        apiStatus = 'ok';
        prodApi = checkData.external.prod_api;
        magTestApi = checkData.external.mag_test_api;
      }
    } catch (e) { apiStatus = 'error'; }

    const sdkInfo = win.__NEXPAY_DIAG || {};
    let foundObj = win.NexPay || win.nexpay || win.NEXPAY || win.MagNexPay || win.openNexPay;
    let foundName = foundObj ? 'Detected' : '❌ 미검출';
    
    setDiag((prev: any) => ({
      ...prev,
      sdk: foundObj ? (sdkInfo.status === 'MOCK_MODE' ? 'mock' : 'ok') : 'fail',
      apiServer: apiStatus,
      prodApi: prodApi,
      magTestApi: magTestApi,
      latency: Date.now() - start,
      objName: foundName,
      sdkSource: sdkInfo.source || 'NONE',
      logs: sdkInfo.logs || [],
      isMock: sdkInfo.status === 'MOCK_MODE'
    }));
  };

  useEffect(() => {
    if (isAuthorized) {
      api.fetchAdminData().then(setData);
      const timer = setInterval(runSystemCheck, 2000);
      return () => clearInterval(timer);
    }
  }, [isAuthorized]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 font-mono">
        <div className="max-w-sm w-full bg-[#1e293b] p-12 rounded-[2rem] shadow-2xl text-center border border-white/10">
          <div className="text-amber-500 text-4xl mb-6">🔒</div>
          <h2 className="text-white text-xl font-black mb-8 tracking-widest">ADMIN ACCESS</h2>
          <form onSubmit={(e) => { e.preventDefault(); if(password === 'admin1234') setIsAuthorized(true); else alert('DENIED'); }} className="space-y-4">
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-5 bg-black/30 rounded-xl text-center font-black text-amber-500 text-2xl outline-none border border-white/5 focus:border-amber-500" placeholder="••••" autoFocus />
            <button className="w-full bg-amber-600 text-white py-4 rounded-xl font-black shadow-lg">CONNECT</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-300 p-4 md:p-10 font-mono">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-1 bg-[#1e293b] p-8 rounded-3xl border border-white/5">
            <h1 className="text-amber-500 font-black text-xl tracking-tighter">SYSTEM HQ</h1>
            <div className="text-[9px] text-gray-500 mt-2 font-bold uppercase tracking-widest">MODE: <span className={diag.isMock ? 'text-amber-400' : 'text-green-500'}>{diag.isMock ? 'VIRTUAL_SIMULATION' : 'LIVE_PRODUCTION'}</span></div>
          </div>

          <div className={`p-8 rounded-3xl border transition-all ${diag.magTestApi === 'ONLINE' ? 'bg-green-900/10 border-green-500/30' : 'bg-red-900/10 border-red-500/30'}`}>
            <div className="text-[10px] text-gray-400 font-black mb-4 uppercase tracking-widest">MagNex Server (External)</div>
            <div className={`text-2xl font-black mb-2 ${diag.magTestApi === 'ONLINE' ? 'text-green-500' : 'text-red-500'}`}>
                {diag.magTestApi === 'ONLINE' ? '✅ LIVE' : '❌ DOWN'}
            </div>
            <div className="text-[8px] text-gray-600">Proxy 통로를 통해 우회 접속 중입니다.</div>
          </div>

          <div className={`p-8 rounded-3xl border transition-all ${diag.isMock ? 'bg-amber-900/20 border-amber-500/30' : 'bg-[#1e293b] border-green-500/30'}`}>
            <div className="text-[10px] text-gray-400 font-black mb-4 uppercase tracking-widest">Active Engine</div>
            <div className="text-2xl font-black text-white mb-2">
              {diag.isMock ? '🧪 MOCK_ACTIVE' : (diag.sdk === 'ok' ? '✅ SDK_BOUND' : '❌ NOT_FOUND')}
            </div>
            <div className="text-[10px] font-bold text-amber-500/70">{diag.sdkSource === 'VIRTUAL_ENGINE' ? '가상 엔진 작동 중' : `소스: ${diag.sdkSource}`}</div>
          </div>

          <div className="bg-gray-900 p-8 rounded-3xl border border-white/5 flex flex-col justify-center">
             <button onClick={() => window.location.reload()} className="w-full bg-amber-600 text-white py-3 rounded-xl font-black shadow-lg hover:bg-amber-700 transition-all">REBOOT</button>
             <div className="text-center text-[8px] font-bold text-gray-600 mt-2 uppercase">Latency: {diag.latency}ms</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-3xl">
                <h4 className="text-blue-500 text-xs font-black mb-3">🛡️ 보안(CORS/Mixed Content) 우회 알림</h4>
                <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                  브라우저는 HTTPS 사이트에서 HTTP 리소스를 불러오는 것을 차단합니다. 
                  현재 <b>PET_SITTER_SAFE_PROXY</b>가 가동되어 서버 대 서버로 파일을 가져온 뒤 HTTPS로 안전하게 주입하고 있습니다. 
                  자동으로 결제 엔진이 로드되지 않을 경우에만 수동 패치를 이용해 주세요.
                </p>
            </div>

            <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-white/5 shadow-2xl relative">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-amber-500 font-black text-sm flex items-center gap-2">⚡ SDK EMERGENCY PATCH</h3>
               </div>
               <textarea 
                 value={patchCode}
                 onChange={e => setPatchCode(e.target.value)}
                 className="w-full h-40 bg-black/60 border border-white/10 rounded-2xl p-5 text-[9px] font-mono text-green-400 outline-none focus:border-amber-500/50"
                 placeholder="복사한 nexpay.js 코드를 여기에 붙여넣으세요..."
               />
               <div className="flex gap-2">
                <button onClick={() => { localStorage.setItem('__NEXPAY_PATCH_CODE', patchCode); alert('PATCH APPLIED'); window.location.reload(); }} className="flex-1 mt-4 bg-amber-700 text-white py-4 rounded-2xl font-black shadow-xl hover:bg-amber-600 transition-all">APPLY PATCH</button>
                <button onClick={() => { localStorage.removeItem('__NEXPAY_PATCH_CODE'); window.location.reload(); }} className="mt-4 bg-red-900/30 text-red-500 px-6 py-4 rounded-2xl font-black">RESET</button>
               </div>
            </div>
          </div>

          <div className="bg-black p-8 rounded-[2rem] border border-white/5 h-[580px] flex flex-col">
            <div className="text-[9px] font-black text-amber-500 mb-4 uppercase tracking-widest">System Boot Trace</div>
            <div className="flex-1 overflow-y-auto font-mono text-[10px] text-green-500/80 space-y-1 no-scrollbar">
              {diag.logs.map((h:string, i:number) => (
                <div key={i} className={`border-l pl-2 ${h.includes('❌') ? 'border-red-500/50 text-red-400' : 'border-green-500/20'}`}>
                    {h}
                </div>
              ))}
              <div className="flex gap-2 animate-pulse mt-2"><span className="bg-green-500 w-1.5 h-3"></span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
