import React, { useState } from 'react';

interface WelcomeScreenProps {
  onLogin: () => void;
  loginError: string | null;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLogin, loginError }) => {
  const [isStorming, setIsStorming] = useState(false);

  return (
    <div className={`fixed inset-0 z-[2000] bg-[#020617] flex flex-col items-center justify-center overflow-hidden transition-colors duration-300 ${isStorming ? 'bg-slate-900' : ''}`}>
      {/* Abstract Glowing Aura Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-purple-700/20 blur-[100px] animate-pulse mix-blend-screen" style={{ animationDuration: '4s' }}></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-blue-700/20 blur-[100px] animate-pulse mix-blend-screen" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
        <div className="absolute top-[20%] left-[30%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[100px] animate-pulse mix-blend-screen" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
      </div>
      
      {isStorming && (
        <>
          <div className="absolute inset-0 bg-white/5 animate-pulse mix-blend-overlay z-0 pointer-events-none"></div>
          <div className="absolute -top-[50%] left-[20%] w-2 h-[200%] bg-gradient-to-b from-yellow-200 via-yellow-400 to-transparent blur-sm rotate-[25deg] animate-pulse z-0 pointer-events-none"></div>
          <div className="absolute -top-[20%] right-[30%] w-4 h-[150%] bg-gradient-to-b from-green-300 via-emerald-400 to-transparent blur-md -rotate-[15deg] animate-pulse duration-75 z-0 pointer-events-none"></div>
          <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-yellow-500/10 to-emerald-500/10 animate-pulse blur-3xl z-0 pointer-events-none"></div>
        </>
      )}

      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
        <div 
          onMouseEnter={() => setIsStorming(true)}
          onMouseLeave={() => setIsStorming(false)}
          className={`cursor-pointer w-24 h-24 rounded-3xl flex items-center justify-center mb-8 border transition-all duration-300 ${
            isStorming 
              ? 'bg-emerald-500/20 border-yellow-400/50 shadow-[0_0_60px_rgba(250,204,21,0.3)] scale-110 ' 
              : 'bg-blue-600/20 border-blue-500/30 shadow-[0_0_40px_rgba(37,99,235,0.2)]'
          }`}
        >
          <div className={`text-4xl transition-all duration-300 ${
            isStorming ? 'text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-emerald-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] scale-110' : 'text-blue-500'
          }`}>
            <i className="fa-solid fa-bolt"></i>
          </div>
        </div>
        
        <h1 className={`text-5xl font-black tracking-tight mb-4 uppercase text-transparent bg-clip-text drop-shadow-sm transition-all duration-500 ${
          isStorming 
            ? 'bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 scale-[1.02]' 
            : 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600'
        }`}>
          S.P.A.M.
        </h1>
        <p className="text-slate-400 font-mono text-sm mb-12 tracking-widest uppercase">
          Systematic Productivity<br/>& Activity Management
        </p>
        
        <div className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-2">Google Sign In Required</h2>
          <p className="text-slate-400 text-sm mb-8">Authenticate to sync your execution parameters and bypass paralysis.</p>
          
          {loginError && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {loginError}
            </div>
          )}
          
          <button 
            onClick={onLogin}
            className="group relative w-full flex items-center justify-center gap-3 bg-white text-slate-900 px-6 py-4 rounded-xl font-bold transition-all duration-500 ease-out hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 -left-[100%] h-full w-[50%] skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:left-[200%] transition-all duration-1000 ease-in-out z-10"></div>
            <i className="fa-brands fa-google text-red-500 group-hover:text-white transition-colors duration-500 relative z-20 drop-shadow-sm"></i>
            <span className="relative z-20 group-hover:text-white transition-colors duration-500 drop-shadow-sm">Sign in with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
