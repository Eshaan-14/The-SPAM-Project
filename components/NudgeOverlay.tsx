
import React from 'react';
import { NudgeState } from '../types';

interface NudgeOverlayProps {
  nudge: NudgeState;
  onClose: () => void;
  onStart: () => void;
}

const NudgeOverlay: React.FC<NudgeOverlayProps> = ({ nudge, onClose, onStart }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm w-full animate-in slide-in-from-bottom-10 duration-500">
      <div className="glass border-l-4 border-l-rose-500 p-5 rounded-2xl shadow-2xl flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/300/20 rounded-xl flex items-center justify-center shrink-0">
            <i className="fa-solid fa-triangle-exclamation text-rose-500 text-xl"></i>
          </div>
          
          <div className="flex-1">
            <h4 className="font-bold text-slate-100 text-sm mb-1">Coach Insight</h4>
            <p className="text-xs text-rose-300 font-medium italic leading-relaxed mb-1">
              "Stop planning. Act more. The decision engine has flagged this as critical."
            </p>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Task: {nudge.taskName}
            </p>
          </div>
          
          <button onClick={onClose} className="text-slate-600 dark:text-slate-300 hover:text-slate-400 self-start">
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={onStart}
            className="flex-1 bg-rose-600 hover:bg-rose-50 dark:bg-rose-900/300 text-slate-900 dark:text-white text-[10px] font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-rose-900/20"
          >
            EXECUTE NOW
          </button>
          <button 
            onClick={onClose}
            className="px-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:bg-slate-800 text-slate-400 text-[10px] font-bold py-2.5 rounded-lg transition-all"
          >
            LATER
          </button>
        </div>
      </div>
    </div>
  );
};

export default NudgeOverlay;
