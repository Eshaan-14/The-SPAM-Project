import React, { useState } from 'react';
import { Task } from '../types';
import { getSchedulingOptimization } from '../ai';
import ReactMarkdown from 'react-markdown';

interface ModusOperandiProps {
  tasks: Task[];
  theme?: 'dark' | 'light';
}

const ModusOperandi: React.FC<ModusOperandiProps> = ({ tasks }) => {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await getSchedulingOptimization(tasks);
      setSuggestion(result);
    } catch (error) {
      setSuggestion("Strategic engine offline. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`glass p-6 rounded-[2.5rem] border border-white/5 relative overflow-hidden transition-all duration-500 ${suggestion ? 'row-span-2' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight theme-text flex items-center gap-2">
            <i className="fa-solid fa-wand-magic-sparkles text-[var(--spam-purple)]"></i>
            AI Scheduler
          </h3>
          <p className="text-[10px] theme-text-muted uppercase tracking-widest mt-1">Strategic Execution Engine</p>
        </div>
        {!suggestion && (
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 shadow-lg ${loading ? 'bg-slate-700 animate-pulse' : 'bg-[var(--spam-purple)] hover:opacity-90 text-slate-900 dark:text-white'}`}
          >
            <i className={`fa-solid ${loading ? 'fa-circle-notch fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
          </button>
        )}
      </div>

      {suggestion ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="theme-text text-xs leading-relaxed">
                <ReactMarkdown>{suggestion}</ReactMarkdown>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
             <button 
               onClick={() => setSuggestion(null)}
               className="text-[10px] font-black uppercase tracking-widest theme-text-muted hover:text-[var(--spam-purple)] transition-colors"
             >
               Close Strategy
             </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center opacity-60">
          <div className="w-16 h-16 rounded-full bg-[var(--spam-purple)]/10 flex items-center justify-center text-[var(--spam-purple)] mb-3">
             <i className="fa-solid fa-brain text-2xl"></i>
          </div>
          <p className="text-[10px] theme-text-muted uppercase tracking-widest max-w-[200px]">
            Initialize AI analysis to optimize your execution path.
          </p>
        </div>
      )}
    </div>
  );
};

export default ModusOperandi;
