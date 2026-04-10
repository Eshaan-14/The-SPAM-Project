
import React, { useState } from 'react';

interface ChaosControlProps {
  chaosMinutes: number;
  setChaosMinutes: (m: number) => void;
}

const ChaosControl: React.FC<ChaosControlProps> = ({ chaosMinutes, setChaosMinutes }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all relative active:scale-95 group overflow-hidden border ${chaosMinutes > 0 ? 'bg-rose-600 text-slate-900 dark:text-white border-rose-600 shadow-md urgency-pulse' : 'bg-white dark:bg-slate-900 text-rose-500 border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:bg-rose-900/30 shadow-sm'}`}
        title="Chaos Injection"
      >
        <i className={`fa-solid ${chaosMinutes > 0 ? 'fa-fire-flame-simple' : 'fa-bolt-lightning'} text-lg`}></i>
        {chaosMinutes > 0 && (
          <span className="absolute -top-1 -right-1 bg-white dark:bg-slate-900 text-rose-600 text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800 shadow-sm tabular-nums">
            {chaosMinutes}m
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute top-full right-0 mt-3 z-[110] w-[300px] bg-white dark:bg-slate-900 p-6 rounded-2xl animate-in slide-in-from-top-2 duration-300 border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider">Chaos Magnitude</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Injection Intensity</p>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">+{chaosMinutes}m</div>
              </div>
              
              {/* Range adjustment bar */}
              <div className="space-y-2">
                <input 
                  type="range" 
                  min="0" 
                  max="240" 
                  step="5"
                  value={chaosMinutes}
                  onChange={(e) => setChaosMinutes(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-50 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  style={{
                    background: `linear-gradient(to right, #e11d48 ${ (chaosMinutes / 240) * 100 }%, #f1f5f9 0%)`
                  }}
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>0m</span>
                  <span>120m</span>
                  <span>240m</span>
                </div>
              </div>

              {/* Quick Select Keys */}
              <div className="grid grid-cols-4 gap-2">
                {[10, 30, 60, 120].map(mins => (
                  <button
                    key={mins}
                    onClick={() => setChaosMinutes(mins)}
                    className="py-3 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider active:scale-95 border bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:bg-rose-900/30 hover:text-rose-600 hover:border-rose-200 dark:border-rose-800"
                  >
                    +{mins}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => { setChaosMinutes(0); setIsOpen(false); }}
                  className="flex-1 py-3 text-[10px] font-bold bg-slate-50 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors uppercase tracking-wider text-slate-600 dark:text-slate-300"
                >
                  Purge
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-slate-900 dark:text-white rounded-lg transition-colors uppercase tracking-wider shadow-sm"
                >
                  Commit
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          border: 3px solid #e11d48;
        }
      `}</style>
    </div>
  );
};

export default ChaosControl;
