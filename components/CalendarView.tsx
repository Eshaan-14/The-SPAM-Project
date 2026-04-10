
import React, { useState, useMemo } from 'react';
import { Task, PriorityLevel } from '../types';
import { projectTasksInRange } from '../utils';

interface CalendarViewProps {
  tasks: Task[];
  selectedDate: Date;
  selectedGoalId?: string;
  onSelectDate: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ tasks, selectedDate, selectedGoalId = 'all', onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const [viewMode, setViewMode] = useState<'month' | 'day'>('month');

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    } else {
      const prevDay = new Date(selectedDate);
      prevDay.setDate(prevDay.getDate() - 1);
      onSelectDate(prevDay);
      setCurrentMonth(new Date(prevDay.getFullYear(), prevDay.getMonth(), 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    } else {
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      onSelectDate(nextDay);
      setCurrentMonth(new Date(nextDay.getFullYear(), nextDay.getMonth(), 1));
    }
  };

  const monthTasks = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const startMs = new Date(year, month, 1).getTime();
    const endMs = new Date(year, month + 1, 1).getTime();
    
    const filteredTasks = selectedGoalId === 'all' 
      ? tasks 
      : tasks.filter(m => m.goalId === selectedGoalId);

    return projectTasksInRange(filteredTasks, startMs, endMs);
  }, [tasks, currentMonth, selectedGoalId]);

  const dayTasks = useMemo(() => {
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const filteredTasks = selectedGoalId === 'all' 
      ? tasks 
      : tasks.filter(m => m.goalId === selectedGoalId);

    return projectTasksInRange(filteredTasks, startOfDay.getTime(), endOfDay.getTime());
  }, [tasks, selectedDate, selectedGoalId]);

  const priorityColors: Record<PriorityLevel, string> = {
    [PriorityLevel.CRITICAL]: '#e11d48', // rose-600
    [PriorityLevel.HIGH]: '#ea580c', // orange-600
    [PriorityLevel.MEDIUM]: '#6366f1', // emerald-500
    [PriorityLevel.LOW]: '#64748b', // slate-500
  };

  const renderDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="min-h-[120px] bg-slate-50 dark:bg-slate-800/50 border-b border-r border-slate-100 dark:border-slate-800"></div>);
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toDateString();
      const isToday = dateStr === new Date().toDateString();
      const isSelected = dateStr === selectedDate.toDateString();

      const dailyTasks = monthTasks.filter(m => new Date(m.deadline).toDateString() === dateStr);

      cells.push(
        <div
          key={day}
          onClick={() => {
            onSelectDate(date);
            setViewMode('day');
          }}
          className={`min-h-[120px] p-2 border-b border-r border-slate-100 dark:border-slate-800 transition-all cursor-pointer group hover:bg-slate-50 dark:bg-slate-800 relative ${isSelected ? 'ring-2 ring-blue-500 z-10 shadow-sm bg-blue-50 dark:bg-blue-900/30/30' : 'bg-white dark:bg-slate-900'}`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}>
              {day}
            </span>
            {dailyTasks.length > 0 && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {dailyTasks.length} {dailyTasks.length === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <div className="space-y-1 overflow-hidden max-h-[80px]">
            {dailyTasks.slice(0, 3).map(task => {
              const pColor = priorityColors[task.priority];
              const taskBaseStyle = 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300';

              return (
                <div 
                  key={task.id} 
                  className={`text-[10px] px-1.5 py-0.5 rounded truncate border border-slate-200 dark:border-slate-700 font-bold uppercase tracking-wider border-l-[3px] ${task.isCompleted ? 'opacity-50 line-through bg-slate-50 dark:bg-slate-800 text-slate-400 border-l-slate-300' : taskBaseStyle}`}
                  style={!task.isCompleted ? { borderLeftColor: pColor } : {}}
                >
                  {task.name}
                </div>
              );
            })}
            {dailyTasks.length > 3 && (
              <div className="text-[10px] text-slate-400 font-bold uppercase text-center mt-1">+ {dailyTasks.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }

    return cells;
  };

  const renderHourlyView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const allDayTasks = dayTasks.filter(m => m.hasTime === false);
    
    return (
      <div className="flex flex-col divide-y divide-slate-100 bg-white dark:bg-slate-900">
        {allDayTasks.length > 0 && (
          <div className="flex min-h-[80px] bg-indigo-50/50 dark:bg-indigo-900/10 transition-colors">
            <div className="w-20 p-4 text-right border-r border-slate-100 dark:border-slate-800 shrink-0">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">All Day</span>
            </div>
            <div className="flex-1 p-2 flex flex-col gap-2">
              {allDayTasks.map(task => {
                const pColor = priorityColors[task.priority];
                const taskBaseStyle = 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-sm';
                
                return (
                  <div 
                    key={task.id} 
                    className={`p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold uppercase tracking-wider border-l-[4px] flex justify-between items-center ${task.isCompleted ? 'opacity-50 line-through bg-slate-50 dark:bg-slate-800 text-slate-400 border-l-slate-300' : taskBaseStyle}`}
                    style={!task.isCompleted ? { borderLeftColor: pColor } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{task.name}</span>
                    </div>
                    <span className="text-xs text-slate-400">{task.estimatedDuration}m</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {hours.map(hour => {
          const hourTasks = dayTasks.filter(m => m.hasTime !== false && new Date(m.deadline).getHours() === hour);
          const displayHour = hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`;
          
          return (
            <div key={hour} className="flex min-h-[80px] hover:bg-slate-50 dark:bg-slate-800 transition-colors">
              <div className="w-20 p-4 text-right border-r border-slate-100 dark:border-slate-800 shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{displayHour}</span>
              </div>
              <div className="flex-1 p-2 flex flex-col gap-2">
                {hourTasks.map(task => {
                  const pColor = priorityColors[task.priority];
                  const taskBaseStyle = 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-sm';
                  const taskMinutes = new Date(task.deadline).getMinutes();
                  const displayMinutes = taskMinutes < 10 ? `0${taskMinutes}` : taskMinutes;

                  return (
                    <div 
                      key={task.id} 
                      className={`p-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold uppercase tracking-wider border-l-[4px] flex justify-between items-center ${task.isCompleted ? 'opacity-50 line-through bg-slate-50 dark:bg-slate-800 text-slate-400 border-l-slate-300' : taskBaseStyle}`}
                      style={!task.isCompleted ? { borderLeftColor: pColor } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400">{displayHour.split(' ')[0]}:{displayMinutes} {displayHour.split(' ')[1]}</span>
                        <span className="text-sm">{task.name}</span>
                      </div>
                      <span className="text-xs text-slate-400">{task.estimatedDuration}m</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const yearName = currentMonth.getFullYear();
  const dayName = selectedDate.toLocaleString('default', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in duration-500 shadow-sm max-w-5xl mx-auto">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50 dark:bg-slate-800/50">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Master Schedule</h2>
          <p className="text-sm text-slate-400 uppercase tracking-wider mt-1 font-medium">Timeline Visualization</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex p-1 bg-slate-200/50 rounded-lg mr-2">
            <button onClick={() => setViewMode('month')} className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'month' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>Month</button>
            <button onClick={() => setViewMode('day')} className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'day' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>Day</button>
          </div>

          <button 
            onClick={handlePrev}
            className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 flex items-center justify-center transition-all active:scale-95 shadow-sm"
          >
            <i className="fa-solid fa-chevron-left text-sm"></i>
          </button>
          <div className="text-lg font-bold uppercase tracking-wider min-w-[200px] text-center text-slate-900 dark:text-white">
            {viewMode === 'month' ? (
              <>{monthName} <span className="text-indigo-600">{yearName}</span></>
            ) : (
              <span className="text-indigo-600">{dayName}</span>
            )}
          </div>
          <button 
            onClick={handleNext}
            className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 flex items-center justify-center transition-all active:scale-95 shadow-sm"
          >
            <i className="fa-solid fa-chevron-right text-sm"></i>
          </button>
        </div>
      </div>

      {viewMode === 'month' ? (
        <>
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200 dark:border-slate-700 last:border-r-0">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-800 gap-[1px]">
            {renderDays()}
          </div>
        </>
      ) : (
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
          {renderHourlyView()}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
