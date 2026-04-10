
import React from 'react';

interface OptimizationModalProps {
  content: string;
  onClose: () => void;
  isLoading: boolean;
}

const OptimizationModal: React.FC<OptimizationModalProps> = ({ content, onClose, isLoading }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="glass p-8 rounded-[2.5rem] w-full max-w-2xl border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-300 max-h-[85vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-inherit pt-2 pb-4 z-10">
          <div>
            <h3 className="text-2xl font-black flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/40">
                <i className="fa-solid fa-wand-magic-sparkles"></i>
              </div>
              AI Schedule Optimizer
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Strategic Conflict Analysis</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:bg-white dark:bg-slate-900/5 theme-text-muted">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fa-solid fa-bolt text-blue-500 animate-pulse"></i>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-widest text-indigo-400">Processing Variables</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Identifying danger zones...</p>
            </div>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none pb-6">
            <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium theme-text">
              {content.split('\n').map((line, i) => {
                if (line.startsWith('#')) return <h4 key={i} className="text-indigo-500 font-black uppercase tracking-wider mt-6 mb-2">{line.replace(/#/g, '').trim()}</h4>;
                if (line.startsWith('-') || line.startsWith('*')) return <li key={i} className="ml-4 mb-1">{line.substring(1).trim()}</li>;
                return <p key={i} className="mb-4">{line}</p>;
              })}
            </div>
            
            <div className="mt-10 p-6 rounded-3xl bg-indigo-600/10 border border-indigo-500/20">
               <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <div>
                    <h5 className="font-black text-xs uppercase tracking-widest text-indigo-400 mb-1">SPAM Verdict</h5>
                    <p className="text-xs theme-text-muted">Use these insights to bypass decision paralysis. The engine has calculated the highest probability path for successful execution.</p>
                  </div>
               </div>
            </div>
          </div>
        )}

        <button 
          onClick={onClose}
          className="w-full mt-8 py-5 bg-blue-500 hover:bg-blue-400 text-white border-b-4 border-blue-700 hover:border-blue-600 active:border-b-0 active:translate-y-[4px] font-black rounded-2xl text-xs uppercase tracking-[0.3em] transition-all"
        >
          Acknowledge & Execute
        </button>
      </div>
    </div>
  );
};

export default OptimizationModal;
