
import React, { useState, useMemo } from 'react';
import { Task, Goal } from '../types';
import TaskCard from './TaskCard';
import { scheduleTasks } from '../utils';

interface DashboardProps {
  activeTasks: Task[];
  completedTasks: Task[];
  goals: Goal[];
  chaosMinutes: number;
  currentTime: number;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onFocus: (id: string) => void;
  onEdit: (task: Task) => void;
  onReorder?: (newIds: string[]) => void;
}

type SortMode = 'schedule' | 'deadline' | 'priority' | 'createdAt';

const Dashboard: React.FC<DashboardProps> = ({ 
  activeTasks, 
  completedTasks, 
  goals,
  chaosMinutes, 
  currentTime,
  onComplete, 
  onDelete, 
  onFocus,
  onEdit,
  onReorder,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('schedule');
  const [sortDesc, setSortDesc] = useState(false);

  const getGoal = (id?: string) => goals.find(g => g.id === id);

  const displayTasks = useMemo(() => {
    if (sortMode === 'schedule') {
      return scheduleTasks(activeTasks, currentTime);
    }
    
    const sorted = [...activeTasks].sort((a, b) => {
      let diff = 0;
      if (sortMode === 'deadline') {
        diff = a.deadline - b.deadline;
      } else if (sortMode === 'priority') {
        const priorityOrder: Record<string, number> = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
        diff = priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortMode === 'createdAt') {
        diff = a.createdAt - b.createdAt;
      }
      return sortDesc ? -diff : diff;
    });
    return sorted;
  }, [activeTasks, currentTime, sortMode, sortDesc]);

  const nowTask = displayTasks.length > 0 ? displayTasks[0] : null;
  const nextTask = displayTasks.length > 1 ? displayTasks[1] : null;
  const laterTasks = displayTasks.slice(2, sortMode === 'schedule' ? 7 : undefined);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || !onReorder) return;
    
    const newTasks = [...laterTasks];
    const [removed] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, removed);
    
    // Merge back to maintain overall order
    const allIds = [
      ...(nowTask ? [nowTask.id] : []),
      ...(nextTask ? [nextTask.id] : []),
      ...newTasks.map(t => t.id)
    ];
    onReorder(allIds);
    
    setDraggedIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      
      {/* Systematic Productivity Section */}
      <div className="space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-700 pb-4 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
              Systematic Productivity
            </h1>
            <p className="text-xs text-slate-500 mt-1">Today's immediate focus and execution</p>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={sortMode} 
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              <option value="schedule">Smart Schedule</option>
              <option value="deadline">Deadline</option>
              <option value="priority">Priority</option>
              <option value="createdAt">Creation Date</option>
            </select>
            {sortMode !== 'schedule' && (
              <button 
                onClick={() => setSortDesc(!sortDesc)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title={sortDesc ? "Descending" : "Ascending"}
              >
                <i className={`fa-solid fa-arrow-${sortDesc ? 'down' : 'up'}`}></i>
              </button>
            )}
          </div>
        </div>

        {/* Now Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i className="fa-solid fa-play text-emerald-500 text-sm"></i>
              Now
            </h2>
          </div>

          {!nowTask ? (
            <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
              <p className="text-slate-400 text-xs">No tasks scheduled right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <TaskCard 
                key={`task-${nowTask.id}`} 
                task={nowTask} 
                goal={getGoal(nowTask.goalId)}
                chaosMinutes={chaosMinutes} 
                isNextAction={true}
                onComplete={() => onComplete(nowTask.id)}
                onDelete={() => onDelete(nowTask.id)}
                onFocus={() => onFocus(nowTask.id)}
                onEdit={() => onEdit(nowTask)}
              />
            </div>
          )}
        </section>

        {/* Next Section */}
        {nextTask && (
          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-forward-step text-emerald-500 text-sm"></i>
                Next
              </h2>
            </div>

            <div className="space-y-3">
              <TaskCard 
                key={`task-${nextTask.id}`} 
                task={nextTask} 
                goal={getGoal(nextTask.goalId)}
                chaosMinutes={chaosMinutes} 
                isNextAction={false}
                onComplete={() => onComplete(nextTask.id)}
                onDelete={() => onDelete(nextTask.id)}
                onFocus={() => onFocus(nextTask.id)}
                onEdit={() => onEdit(nextTask)}
              />
            </div>
          </section>
        )}

        {/* Completed Tasks Section */}
        {completedTasks.length > 0 && (
          <section className="space-y-6">
            <div className="flex justify-between items-end px-2">
              <div>
                <h2 className="text-lg font-bold text-slate-400 tracking-tight">Today's Victories</h2>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-full text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  {completedTasks.length} Completed
                </span>
              </div>
            </div>

            <div className="space-y-3 opacity-60 hover:opacity-100 transition-opacity">
              {completedTasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  goal={getGoal(task.goalId)}
                  chaosMinutes={0} 
                  onComplete={() => {}}
                  onDelete={() => onDelete(task.id)}
                  onFocus={() => {}}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Activity Management Section */}
      {laterTasks.length > 0 && (
        <div className="space-y-8 pt-8 border-t-4 border-slate-100 dark:border-slate-800">
          <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
            <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
              Activity Management
            </h1>
            <p className="text-xs text-slate-500 mt-1">Upcoming tasks and backlog</p>
          </div>

          <section className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <i className="fa-solid fa-list text-slate-500 text-sm"></i>
                Later
              </h2>
              <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-800 text-slate-400">
                {laterTasks.length} Tasks
              </span>
            </div>

            <div className="space-y-4">
              {laterTasks.map((task, index) => (
                <div
                  key={task.id}
                  draggable={!task.isCompleted}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`transition-all duration-300 relative ${draggedIndex === index ? 'opacity-40 grayscale cursor-grabbing scale-95' : 'cursor-grab active:cursor-grabbing'}`}
                >
                  {overIndex === index && draggedIndex !== index && (
                    <div className="absolute -top-3 left-0 right-0 h-1 bg-emerald-50 dark:bg-emerald-900/30 rounded-full shadow-sm z-20 animate-pulse" />
                  )}
                  
                  <TaskCard 
                    task={task} 
                    goal={getGoal(task.goalId)}
                    chaosMinutes={chaosMinutes} 
                    isNextAction={false}
                    onComplete={() => onComplete(task.id)}
                    onDelete={() => onDelete(task.id)}
                    onFocus={() => onFocus(task.id)}
                    onEdit={() => onEdit(task)}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
