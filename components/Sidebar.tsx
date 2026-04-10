import React from 'react';
import { Goal } from '../types';

interface SidebarProps {
  goals: Goal[];
  activeTab: 'dashboard' | 'calendar' | 'goals' | 'modus';
  setActiveTab: (tab: 'dashboard' | 'calendar' | 'goals' | 'modus') => void;
  selectedGoalId: string;
  setSelectedGoalId: (id: string) => void;
  onOpenGoalModal: () => void;
  streak: number;
  progressPercent: number;
  vibe: 'positive' | 'neutral' | 'negative';
}

const Sidebar: React.FC<SidebarProps> = ({
  goals,
  activeTab,
  setActiveTab,
  selectedGoalId,
  setSelectedGoalId,
  onOpenGoalModal,
  streak,
  progressPercent,
  vibe
}) => {
  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 h-screen flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-sm font-black tracking-tight text-slate-900 dark:text-white leading-loose uppercase">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded mr-2">S</span>ystematic<br/>
          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded mr-2">P</span>roductivity and<br/>
          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded mr-2">A</span>ctivity<br/>
          <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded mr-2">M</span>anagement
        </h1>
      </div>

      <div className="p-4 space-y-2">
        <button
          id="nav-dashboard"
          onClick={() => setActiveTab('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'dashboard'
              ? 'bg-white dark:bg-slate-800 text-blue-600 border-b-4 border-slate-200 dark:border-slate-900 active:border-b-0 active:translate-y-[4px]'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-b-4 border-transparent'
          }`}
        >
          <i className="fa-solid fa-layer-group w-5"></i>
          Dashboard
        </button>
        <button
          id="nav-calendar"
          onClick={() => setActiveTab('calendar')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'calendar'
              ? 'bg-white dark:bg-slate-800 text-blue-600 border-b-4 border-slate-200 dark:border-slate-900 active:border-b-0 active:translate-y-[4px]'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-b-4 border-transparent'
          }`}
        >
          <i className="fa-solid fa-calendar-days w-5"></i>
          Calendar
        </button>
        <button
          id="nav-goals"
          onClick={() => setActiveTab('goals')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'goals'
              ? 'bg-white dark:bg-slate-800 text-blue-600 border-b-4 border-slate-200 dark:border-slate-900 active:border-b-0 active:translate-y-[4px]'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-b-4 border-transparent'
          }`}
        >
          <i className="fa-solid fa-bullseye w-5"></i>
          Goals
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {/* Compact Status Section */}
        <div className="mb-6 space-y-4">
          <div className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border relative overflow-hidden group flex items-center justify-between ${vibe === 'positive' ? 'border-blue-200 dark:border-emerald-800' : vibe === 'negative' ? 'border-rose-200 dark:border-rose-800' : 'border-slate-200 dark:border-slate-700'}`}>
             <div className={`absolute inset-0 opacity-5 blur-3xl transition-colors duration-1000 ${vibe === 'positive' ? 'bg-emerald-50 dark:bg-emerald-900/300' : vibe === 'negative' ? 'bg-rose-50 dark:bg-rose-900/300' : 'bg-blue-50 dark:bg-indigo-900/300'}`} />
             
             <div className="relative z-10">
               <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Current Streak</h3>
               <div className="flex items-baseline gap-1">
                 <span className={`text-2xl font-bold tabular-nums tracking-tighter ${vibe === 'positive' ? 'text-emerald-500' : vibe === 'negative' ? 'text-rose-500' : 'text-indigo-500'}`}>
                   {streak}
                 </span>
                 <span className="text-[10px] font-bold uppercase text-slate-400">Days</span>
               </div>
             </div>
             
             <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-transform group-hover:scale-110 ${vibe === 'positive' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500' : vibe === 'negative' ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-500' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500'}`}>
               <i className={`fa-solid ${vibe === 'positive' ? 'fa-fire' : vibe === 'negative' ? 'fa-triangle-exclamation' : 'fa-bolt'}`}></i>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 relative overflow-hidden flex flex-col justify-center">
             <div className="flex justify-between items-end mb-2">
               <div>
                 <h2 className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Efficiency</h2>
               </div>
               <span className="text-sm font-bold text-indigo-500 font-mono">{Math.round(progressPercent)}%</span>
             </div>
             <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-50 dark:bg-slate-800">
                <div 
                  className="h-full bg-indigo-50 dark:bg-indigo-900/300 transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
             </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Goals</h3>
          <button 
            onClick={onOpenGoalModal}
            className="w-6 h-6 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:text-indigo-600 flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-plus text-xs"></i>
          </button>
        </div>
        
        <div className="space-y-1">
          <button
            onClick={() => setSelectedGoalId('all')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
              selectedGoalId === 'all'
                ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-400 hover:bg-slate-50 dark:bg-slate-800 hover:text-slate-700'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
            All Goals
          </button>
          
          {goals.map(goal => (
            <button
              key={goal.id}
              onClick={() => setSelectedGoalId(goal.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                selectedGoalId === goal.id
                  ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-400 hover:bg-slate-50 dark:bg-slate-800 hover:text-slate-700'
              }`}
            >
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: goal.color }}
              ></div>
              <span className="truncate">{goal.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
