
import React, { useState } from 'react';
import { Goal } from '../types';

interface GoalFormProps {
  onAdd: (goal: Omit<Goal, 'id'>) => void;
  onClose: () => void;
  existingGoals: Goal[];
}

const GoalForm: React.FC<GoalFormProps> = ({ onAdd, onClose, existingGoals }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError('Goal name cannot be empty');
      return;
    }

    const exists = existingGoals.some(
      cat => cat.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (exists) {
      setError('This goal already exists');
      return;
    }

    const colors = [
      '#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', 
      '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', 
      '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', 
      '#f97316', '#ef4444'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    onAdd({ name: trimmedName, color: randomColor });
    setError(null);
  };

  return (
    <div className="glass p-8 rounded-3xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-black theme-text">New Goal</h3>
          <p className="text-xs theme-text-muted uppercase tracking-widest mt-1">Classification Unit</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white dark:bg-slate-900/10 flex items-center justify-center theme-text-muted transition-colors">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-black theme-text-muted uppercase tracking-widest">Goal Name</label>
          <div className="relative">
            <input 
              autoFocus
              type="text" 
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Classes, Club..."
              className={`w-full theme-input border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all ${
                error 
                ? 'border-rose-500 ring-rose-500/20 ring-2' 
                : 'focus:ring-[var(--spam-purple)]'
              }`}
            />
            {error && (
              <div className="mt-2 flex items-center gap-2 text-rose-500 text-xs font-black uppercase tracking-wider animate-in slide-in-from-top-1">
                <i className="fa-solid fa-circle-exclamation text-rose-500"></i>
                {error}
              </div>
            )}
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-400 text-white border-b-4 border-blue-700 hover:border-blue-600 active:border-b-0 active:translate-y-[4px] font-bold py-4 rounded-xl transition-all uppercase tracking-wider text-sm"
        >
          Create Goal
        </button>
      </form>
    </div>
  );
};

export default GoalForm;
