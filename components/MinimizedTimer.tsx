
import React from 'react';

interface MinimizedTimerProps {
  taskName: string;
  timeLeft: number;
  totalTime: number;
  isTimerActive: boolean;
  onToggleTimer: () => void;
  onExpand: () => void;
  onClose: () => void;
}

const MinimizedTimer: React.FC<MinimizedTimerProps> = ({ 
  taskName, 
  timeLeft, 
  totalTime, 
  isTimerActive, 
  onToggleTimer, 
  onExpand, 
  onClose 
}) => {
  const displayTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progress = (timeLeft / totalTime) * 100;

  return (
    <div className="fixed bottom-6 right-6 z-[90] w-72 animate-in slide-in-from-right-10 duration-500">
      <div className="glass border-t-2 border-[var(--spam-purple)] p-4 rounded-2xl shadow-2xl flex flex-col gap-3">
        <div className="flex justify-between items-center gap-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-[var(--spam-purple)] uppercase tracking-widest mb-0.5">Focusing On</h4>
            <p className="text-sm font-bold theme-text truncate">{taskName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-mono font-bold theme-text tabular-nums">{displayTime()}</p>
          </div>
        </div>

        <div className="w-full h-1 bg-white dark:bg-slate-900/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--spam-purple)] transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex gap-2">
          <button 
            onClick={onToggleTimer}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center text-xs transition-all ${isTimerActive ? 'bg-white dark:bg-slate-900/10 theme-text-muted' : 'bg-emerald-600 text-slate-900 dark:text-white shadow-lg'}`}
          >
            <i className={`fa-solid ${isTimerActive ? 'fa-pause' : 'fa-play'} mr-2`}></i>
            {isTimerActive ? 'Pause' : 'Resume'}
          </button>
          
          <button 
            onClick={onExpand}
            className="w-10 h-9 rounded-lg bg-[var(--spam-purple)] hover:opacity-90 flex items-center justify-center text-sm transition-all shadow-lg"
          >
            <i className="fa-solid fa-expand"></i>
          </button>

          <button 
            onClick={onClose}
            className="w-10 h-9 rounded-lg bg-white dark:bg-slate-900/10 hover:bg-rose-600 theme-text-muted hover:text-slate-900 dark:text-white flex items-center justify-center text-sm transition-all"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MinimizedTimer;
