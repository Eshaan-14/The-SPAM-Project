import React from 'react';

interface WelcomeScreenProps {
  onLogin: () => void;
  loginError: string | null;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLogin, loginError }) => {
  return (
    <div className="fixed inset-0 z-[2000] bg-[#020617] flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(168,85,247,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(168,85,247,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"></div>
      
      <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6 text-center">
        <div className="w-24 h-24 bg-blue-600/20 rounded-3xl flex items-center justify-center mb-8 border border-blue-500/30 shadow-[0_0_40px_rgba(37,99,235,0.2)]">
          <i className="fa-solid fa-bolt text-4xl text-blue-500"></i>
        </div>
        
        <h1 className="text-4xl font-black tracking-tight text-white mb-4 uppercase">
          <span className="text-blue-500">S</span>.P.A.M.
        </h1>
        <p className="text-slate-400 font-mono text-sm mb-12 tracking-widest uppercase">
          Systematic Productivity<br/>& Activity Management
        </p>
        
        <div className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-2">Identity Link Required</h2>
          <p className="text-slate-400 text-sm mb-8">Authenticate to sync your execution parameters and bypass paralysis.</p>
          
          {loginError && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {loginError}
            </div>
          )}
          
          <button 
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-100 px-6 py-4 rounded-xl font-bold transition-all active:scale-95"
          >
            <i className="fa-brands fa-google text-red-500"></i>
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
