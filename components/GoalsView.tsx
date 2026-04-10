import React, { useMemo } from 'react';
import { Goal, Task } from '../types';
import { motion } from 'motion/react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface GoalsViewProps {
  goals: Goal[];
  tasks: Task[];
}

const GoalsView: React.FC<GoalsViewProps> = ({ goals, tasks }) => {
  const goalMetrics = useMemo(() => {
    return goals.map(goal => {
      const goalTasks = tasks.filter(t => t.goalId === goal.id);
      const completedTasks = goalTasks.filter(t => t.isCompleted);
      const activeTasks = goalTasks.filter(t => !t.isCompleted);
      
      const totalEstimatedMinutes = goalTasks.reduce((acc, t) => acc + t.estimatedDuration, 0);
      const completedMinutes = completedTasks.reduce((acc, t) => acc + t.estimatedDuration, 0);
      
      const progressPercent = totalEstimatedMinutes > 0 
        ? Math.round((completedMinutes / totalEstimatedMinutes) * 100) 
        : 0;

      // Calculate contribution level average
      const totalContribution = completedTasks.reduce((acc, t) => acc + (t.contributionLevel || 5), 0);
      const avgContribution = completedTasks.length > 0 ? (totalContribution / completedTasks.length).toFixed(1) : '0.0';

      // Calculate trend data for sparkline
      const sortedCompletedTasks = [...completedTasks].sort((a, b) => (a.completedAt || a.createdAt) - (b.completedAt || b.createdAt));
      let cumulativeMinutes = 0;
      const trendData = sortedCompletedTasks.map(t => {
        cumulativeMinutes += t.estimatedDuration;
        return {
          time: t.completedAt || t.createdAt,
          minutes: cumulativeMinutes
        };
      });
      
      // Ensure we have at least 2 points to draw a line
      if (trendData.length === 1) {
        trendData.unshift({ time: trendData[0].time - 86400000, minutes: 0 });
      } else if (trendData.length === 0) {
        trendData.push({ time: Date.now() - 86400000, minutes: 0 }, { time: Date.now(), minutes: 0 });
      }

      return {
        ...goal,
        totalTasks: goalTasks.length,
        completedTasks: completedTasks.length,
        activeTasks: activeTasks.length,
        totalEstimatedMinutes,
        completedMinutes,
        progressPercent,
        avgContribution,
        trendData
      };
    }).sort((a, b) => b.progressPercent - a.progressPercent);
  }, [goals, tasks]);

  const lackingGoals = goalMetrics.filter(g => g.progressPercent < 30 && g.totalTasks > 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
        <h1 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
          Goals & Metrics
        </h1>
        <p className="text-xs text-slate-500 mt-1">Track your contribution and identify lacking areas</p>
      </div>

      {lackingGoals.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation"></i>
            Needs Attention
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lackingGoals.map(goal => (
              <div key={`lacking-${goal.id}`} className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 p-4 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: goal.color }}></div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{goal.name}</h3>
                </div>
                <p className="text-xs text-rose-600 dark:text-rose-400 mb-3">
                  Only {goal.progressPercent}% progress. You have {goal.activeTasks} pending tasks for this goal.
                </p>
                <div className="w-full h-2 bg-rose-200 dark:bg-rose-900/50 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${goal.progressPercent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <i className="fa-solid fa-bullseye text-emerald-500"></i>
          All Goals
        </h2>
        
        {goalMetrics.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
            <p className="text-slate-400 text-xs">No goals created yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goalMetrics.map((goal, index) => (
              <motion.div 
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: goal.color }}></div>
                    <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{goal.name}</h3>
                  </div>
                  <span className="text-2xl font-black text-slate-200 dark:text-slate-700">{goal.progressPercent}%</span>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      <span>Progress</span>
                      <span>{Math.round(goal.completedMinutes / 60)}h / {Math.round(goal.totalEstimatedMinutes / 60)}h</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${goal.progressPercent}%`, backgroundColor: goal.color }}
                      ></div>
                    </div>
                  </div>

                  <div className="h-12 w-full mt-2 opacity-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={goal.trendData}>
                        <Line 
                          type="monotone" 
                          dataKey="minutes" 
                          stroke={goal.color} 
                          strokeWidth={2} 
                          dot={false}
                          isAnimationActive={true}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tasks Done</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{goal.completedTasks} <span className="text-xs text-slate-400 font-normal">/ {goal.totalTasks}</span></p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Impact</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{goal.avgContribution} <span className="text-xs text-slate-400 font-normal">/ 10</span></p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default GoalsView;
