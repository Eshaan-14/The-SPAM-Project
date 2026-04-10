
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../types';

interface FocusModeProps {
  task: Task;
  timeLeft: number;
  isTimerActive: boolean;
  onToggleTimer: () => void;
  onMinimize: () => void;
  onClose: () => void;
  onComplete: () => void;
}

const FocusMode: React.FC<FocusModeProps> = ({ 
  task, 
  timeLeft, 
  isTimerActive, 
  onToggleTimer, 
  onMinimize, 
  onClose, 
  onComplete 
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const totalSeconds = task.estimatedDuration * 60;
  const progress = (timeLeft / totalSeconds) * 100;

  const handleCompleteAction = () => {
    setIsCompleting(true);
    setTimeout(() => {
      onComplete();
      setIsCompleting(false);
    }, 1000); // Wait for animation to finish
  };

  const displayTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-[120] bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
      <AnimatePresence>
        {isCompleting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-emerald-500 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl mb-8"
            >
              <i className="fa-solid fa-check text-6xl text-emerald-500"></i>
            </motion.div>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold text-white tracking-tight"
            >
              Task Completed!
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`max-w-xl w-full text-center space-y-12 transition-all duration-500 ${isCompleting ? 'scale-95 opacity-0 blur-sm' : ''}`}>
        <div className="space-y-4">
          <span className="px-3 py-1 bg-emerald-100 dark:bg-blue-900/50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
            Execution Phase
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
            {task.name}
          </h2>
          <p className="text-slate-400 font-medium italic">"Decide on your next action and execute."</p>
        </div>

        <div className="relative flex items-center justify-center">
            <svg className="w-64 h-64 md:w-80 md:h-80 transform -rotate-90">
                <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    className="stroke-slate-100"
                    strokeWidth="8"
                    fill="transparent"
                />
                <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    className="stroke-blue-600 transition-all duration-1000 ease-linear"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray="283%"
                    strokeDashoffset={`${283 * (1 - progress / 100)}%`}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-6xl md:text-7xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    {displayTime()}
                </span>
                <span className="text-slate-400 font-bold uppercase text-xs tracking-wider mt-2">
                    REMAINING
                </span>
            </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button 
            onClick={onToggleTimer}
            title={isTimerActive ? "Pause" : "Resume"}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-xl transition-all shadow-sm border ${isTimerActive ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 hover:bg-slate-50 dark:bg-slate-800' : 'bg-blue-600 border-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            <i className={`fa-solid ${isTimerActive ? 'fa-pause' : 'fa-play'}`}></i>
          </button>
          
          <button 
            onClick={handleCompleteAction}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-slate-900 dark:text-white rounded-2xl font-bold flex items-center gap-3 transition-all shadow-sm"
          >
            <i className="fa-solid fa-check"></i> Complete Task
          </button>
          
          <button 
            onClick={onMinimize}
            title="Minimize"
            className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xl transition-all text-slate-700 shadow-sm"
          >
            <i className="fa-solid fa-compress"></i>
          </button>

          <button 
            onClick={onClose}
            title="Stop Focus"
            className="w-16 h-16 rounded-full bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:bg-rose-900/30 text-rose-600 flex items-center justify-center text-xl transition-all shadow-sm"
          >
            <i className="fa-solid fa-stop"></i>
          </button>
        </div>

        <p className="text-slate-400 text-sm italic">
          Decision fatigue ends here. Just do the work.
        </p>
      </div>
    </div>
  );
};

export default FocusMode;
