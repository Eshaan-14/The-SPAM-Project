
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, UrgencyLevel, PriorityLevel, Goal, ScheduledTask } from '../types';
import { calculateUrgency, formatDuration } from '../utils';

interface TaskCardProps {
  task: Task | ScheduledTask;
  goal?: Goal;
  chaosMinutes: number;
  isNextAction?: boolean;
  onComplete: () => void;
  onDelete: () => void;
  onFocus: () => void;
  onEdit?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, goal, chaosMinutes, isNextAction, onComplete, onDelete, onFocus, onEdit }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const urgency = calculateUrgency(task, chaosMinutes);
  const isCompleted = task.isCompleted;
  const isProjection = task.isProjection;
  const isAutoCompletable = task.isAutoCompletable;
  const scheduledTask = task as ScheduledTask;
  const hasSchedule = scheduledTask.scheduledStart !== undefined;
  
  const handleCompleteAction = () => {
    setIsCompleting(true);
    setTimeout(() => {
      onComplete();
      setIsCompleting(false);
    }, 800); // slightly longer to allow animation to play
  };

  const priorityColors: Record<PriorityLevel, string> = {
    [PriorityLevel.CRITICAL]: 'border-l-rose-500',
    [PriorityLevel.HIGH]: 'border-l-orange-500',
    [PriorityLevel.MEDIUM]: 'border-l-emerald-500',
    [PriorityLevel.LOW]: 'border-l-slate-400',
  };

  const getStyles = () => {
    let classes = `border-l-4 ${priorityColors[task.priority]} `;
    
    if (isCompleted) {
      return classes + 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-75';
    }

    if (isProjection) {
      classes += ' opacity-60 hover:opacity-100 bg-white dark:bg-slate-900';
    } else {
      classes += ' bg-white dark:bg-slate-900 hover:shadow-md';
    }
    
    if (isNextAction && !isCompleted) {
      classes += ' ring-2 ring-blue-500/20';
    }

    switch (urgency.level) {
      case UrgencyLevel.OVERDUE:
        classes += ' border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/30/50';
        break;
      case UrgencyLevel.CRITICAL:
        classes += ' border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/30/50';
        break;
    }
    return classes;
  };

  const getUrgencyTextColor = () => {
    if (isCompleted) return 'text-slate-400';
    switch (urgency.level) {
      case UrgencyLevel.OVERDUE: return 'text-rose-600';
      case UrgencyLevel.CRITICAL: return 'text-orange-600';
      case UrgencyLevel.URGENT: return 'text-amber-600';
      default: return 'text-blue-600';
    }
  };

  const getPriorityBadge = () => {
    if (isCompleted) return 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700';
    switch (task.priority) {
      case PriorityLevel.CRITICAL: return 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 border-rose-200 dark:border-rose-800';
      case PriorityLevel.HIGH: return 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 border-orange-200 dark:border-orange-800';
      case PriorityLevel.MEDIUM: return 'bg-blue-100 dark:bg-indigo-900/50 text-indigo-700 border-indigo-200 dark:border-indigo-800';
      case PriorityLevel.LOW: return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      default: return '';
    }
  };

  return (
    <div 
      className={`group rounded-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 relative overflow-hidden flex flex-col ${getStyles()}`}
    >
      <AnimatePresence>
        {isCompleting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-emerald-500 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <i className="fa-solid fa-check text-3xl text-emerald-500"></i>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 flex flex-col md:flex-row gap-4 relative z-10">
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {!isCompleted && (
              <div className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-grab active:cursor-grabbing">
                <i className="fa-solid fa-grip-vertical text-xs"></i>
              </div>
            )}
            
            {isNextAction && !isCompleted && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white flex items-center gap-1">
                <i className="fa-solid fa-bolt text-[10px]"></i> NEXT
              </span>
            )}

            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityBadge()}`}>
              {task.priority}
            </span>
            
            {goal && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {goal.name}
              </span>
            )}
            
            {isAutoCompletable && !isCompleted && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <i className="fa-solid fa-robot text-[10px]"></i> AUTO
              </span>
            )}
          </div>
          
          <h4 className={`text-base font-semibold text-slate-900 dark:text-white mb-1 ${isCompleted ? 'text-slate-400 line-through' : ''}`}>
            {task.name}
          </h4>

          {task.notes && !isCompleted && (
            <p className="text-sm text-slate-400 mb-3 line-clamp-1">
              {task.notes}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-400">
            {isCompleted ? (
              <span className="flex items-center gap-1.5 text-emerald-600">
                <i className="fa-solid fa-circle-check"></i> Executed {new Date(task.completedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <i className="fa-regular fa-clock text-indigo-500"></i>
                  <span>
                    {hasSchedule 
                      ? formatDuration((scheduledTask.scheduledEnd - scheduledTask.scheduledStart) / 60000) 
                      : formatDuration(task.estimatedDuration)}
                    {scheduledTask.isCompressed && <span className="ml-1 text-orange-500" title="Compressed duration">(Compressed)</span>}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <i className="fa-regular fa-calendar text-indigo-500"></i>
                  <span>
                    {hasSchedule ? (
                      `${new Date(scheduledTask.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(scheduledTask.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                    ) : (
                      <>
                        {new Date(task.deadline).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                        {task.hasTime !== false && ` ${new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      </>
                    )}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:min-w-[120px] border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-4">
          {!isCompleted && !isProjection && (
            <div className="text-left md:text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Window</div>
              <div className={`text-sm font-bold tabular-nums ${getUrgencyTextColor()}`}>
                {urgency.remainingTimeFormatted}
              </div>
            </div>
          )}
          
          <div className="flex gap-1.5">
            {!isCompleted && (
              <>
                {!isProjection && (
                  <button 
                      onClick={onFocus}
                      title="Focus"
                      className="w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-400 text-white border-b-2 border-blue-700 hover:border-blue-600 active:border-b-0 active:translate-y-[2px] flex items-center justify-center text-xs transition-all"
                  >
                    <i className="fa-solid fa-play"></i>
                  </button>
                )}
                <button 
                    onClick={onEdit}
                    title="Edit"
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b-2 border-slate-200 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-700 active:border-b-0 active:translate-y-[2px] flex items-center justify-center text-xs transition-all"
                >
                  <i className="fa-solid fa-pen"></i>
                </button>
                <button 
                    onClick={handleCompleteAction}
                    title="Mark Done"
                    className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white border-b-2 border-emerald-700 hover:border-emerald-600 active:border-b-0 active:translate-y-[2px] flex items-center justify-center text-xs transition-all"
                >
                  <i className="fa-solid fa-check"></i>
                </button>
              </>
            )}
            <button 
                onClick={onDelete}
                title="Delete"
                className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-rose-500 border-b-2 border-slate-200 dark:border-slate-900 hover:bg-rose-50 dark:hover:bg-slate-700 active:border-b-0 active:translate-y-[2px] flex items-center justify-center text-xs transition-all"
            >
              <i className="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
