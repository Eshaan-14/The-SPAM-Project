
import { Task, UrgencyInfo, UrgencyLevel, ScheduledTask } from './types';

export const calculateUrgency = (task: Task, chaosMinutes: number): UrgencyInfo => {
  const now = Date.now();
  const effectiveNow = now + (chaosMinutes * 60000);
  const remainingTimeMs = task.deadline - effectiveNow;
  const remainingTimeMinutes = remainingTimeMs / 60000;
  
  // PRD: Urgency Score = Time Remaining / Estimated Time
  const score = remainingTimeMinutes / task.estimatedDuration;
  
  let level = UrgencyLevel.SAFE;
  if (score < 0) {
    level = UrgencyLevel.OVERDUE;
  }
  else if (score < 1.2) level = UrgencyLevel.CRITICAL;
  else if (score < 2.0) level = UrgencyLevel.URGENT;

  let formatted = '';
  const actualRemainingMs = task.deadline - now;
  
  if (actualRemainingMs < 0) {
    formatted = 'Overdue';
  } else {
    const totalMinutes = Math.floor(actualRemainingMs / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const mins = totalMinutes % 60;

    if (task.hasTime === false) {
      if (days === 0) {
        formatted = 'Today';
      } else if (days === 1) {
        formatted = 'Tomorrow';
      } else {
        formatted = `${days} days`;
      }
    } else {
      if (days > 0) {
        formatted = `${days} day${days > 1 ? 's' : ''} ${hours}h ${mins}m`;
      } else if (hours > 0) {
        formatted = `${hours}h ${mins}m`;
      } else {
        formatted = `${mins}m`;
      }
    }
  }

  return {
    score,
    level,
    remainingTimeFormatted: formatted
  };
};

export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

/**
 * Projects a list of tasks into a time range, expanding recurring tasks.
 */
export const projectTasksInRange = (tasks: Task[], startMs: number, endMs: number): Task[] => {
  const projected: Task[] = [];

  tasks.forEach(task => {
    // Logic fix: If a task is completed, it should NOT recur in the future because its 
    // successor has already been created as a separate task object.
    // We only project recurrence for INCOMPLETE tasks.
    if (task.isCompleted || task.recurrence === 'none' || !task.recurrence) {
      const isCanceled = task.canceledDates?.some(d => {
        const date1 = new Date(d);
        const date2 = new Date(task.deadline);
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
      });
      if (!isCanceled) {
        projected.push(task);
      }
    } else if (task.recurrence === 'daily' || task.recurrence === 'weekly' || task.recurrence === 'monthly') {
      let currentDeadline = task.deadline;
      let intervalMs = 0;
      
      if (task.recurrence === 'daily') intervalMs = 24 * 60 * 60 * 1000;
      else if (task.recurrence === 'weekly') intervalMs = 7 * 24 * 60 * 60 * 1000;
      
      // Safety break to prevent infinite loops
      let iterations = 0;
      while (currentDeadline <= endMs && iterations < 365) { // Increased iteration limit for daily
        if (currentDeadline >= startMs) {
          const isCanceled = task.canceledDates?.some(d => {
            const date1 = new Date(d);
            const date2 = new Date(currentDeadline);
            return date1.getFullYear() === date2.getFullYear() &&
                   date1.getMonth() === date2.getMonth() &&
                   date1.getDate() === date2.getDate();
          });

          if (!isCanceled) {
            projected.push({
              ...task,
              id: iterations === 0 ? task.id : `${task.id}-projection-${iterations}`,
              deadline: currentDeadline,
              isProjection: iterations > 0 
            } as Task & { isProjection?: boolean });
          }
        }
        
        if (task.recurrence === 'monthly') {
          const d = new Date(currentDeadline);
          d.setMonth(d.getMonth() + 1);
          currentDeadline = d.getTime();
        } else {
          currentDeadline += intervalMs;
        }
        
        iterations++;
      }
    }
  });

  return projected;
};

export const calculateStreak = (tasks: Task[]): number => {
  const completedTasks = tasks
    .filter(m => m.isCompleted && m.completedAt)
    .sort((a, b) => b.completedAt! - a.completedAt!);

  if (completedTasks.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if a task was completed today
  const lastTaskDate = new Date(completedTasks[0].completedAt!);
  lastTaskDate.setHours(0, 0, 0, 0);

  // If the last task was completed before yesterday, streak is broken (unless it's 0)
  const diffTime = Math.abs(today.getTime() - lastTaskDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 1) return 0;

  // Count consecutive days backwards
  
  // Use a set of unique dates strings to count days
  const uniqueDates = new Set<string>();
  completedTasks.forEach(m => {
    const d = new Date(m.completedAt!);
    uniqueDates.add(d.toDateString());
  });

  // Simple consecutive check logic
  // We iterate backwards from today (or yesterday if today is empty)
  let checkDate = diffDays === 0 ? today : new Date(today.getTime() - 86400000);
  
  while (true) {
    if (uniqueDates.has(checkDate.toDateString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

export const getVibe = (streak: number, overdueCount: number): 'positive' | 'neutral' | 'negative' => {
  if (overdueCount > 0 && streak === 0) return 'negative';
  if (streak >= 3) return 'positive';
  if (overdueCount > 2) return 'negative';
  return 'neutral';
};

export const getCompletionHistory = (tasks: Task[]): { date: string; count: number; intensity: number }[] => {
  const history: Record<string, number> = {};
  const now = new Date();
  
  // Initialize last 14 days with 0
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    history[d.toDateString()] = 0;
  }

  tasks.forEach(m => {
    if (m.isCompleted && m.completedAt) {
      const d = new Date(m.completedAt).toDateString();
      if (history[d] !== undefined) {
        history[d]++;
      }
    }
  });

  return Object.entries(history).map(([date, count]) => ({
    date,
    count,
    intensity: Math.min(4, Math.ceil(count / 2)) // 0-4 scale for heatmap color
  }));
};

export const scheduleTasks = (tasks: Task[], currentTime: number): ScheduledTask[] => {
  const hardBlocks = tasks.filter(t => t.isHardBlock && t.startTime !== undefined).sort((a, b) => a.startTime! - b.startTime!);
  const fluidBlocks = tasks.filter(t => !t.isHardBlock);

  const scheduledTasks: ScheduledTask[] = [];
  let currentCursor = currentTime;

  const events = hardBlocks.map(hb => ({
    start: hb.startTime!,
    end: hb.startTime! + (hb.estimatedDuration * 60000),
    task: hb
  }));

  let fluidIndex = 0;

  while (fluidIndex < fluidBlocks.length) {
    const task = fluidBlocks[fluidIndex];
    let idealDurationMs = task.estimatedDuration * 60000;
    let minDurationMs = (task.minDuration || task.estimatedDuration) * 60000;

    let overlappingEvent = events.find(e => currentCursor >= e.start && currentCursor < e.end);
    if (overlappingEvent) {
      currentCursor = overlappingEvent.end;
      continue;
    }

    let nextEvent = events.find(e => e.start > currentCursor);
    let availableTimeMs = nextEvent ? nextEvent.start - currentCursor : Infinity;

    if (availableTimeMs >= minDurationMs) {
      let scheduledDurationMs = Math.min(idealDurationMs, availableTimeMs);
      
      scheduledTasks.push({
        ...task,
        scheduledStart: currentCursor,
        scheduledEnd: currentCursor + scheduledDurationMs,
        isCompressed: scheduledDurationMs < idealDurationMs
      });

      currentCursor += scheduledDurationMs;
      fluidIndex++;
    } else {
      if (nextEvent) {
        currentCursor = nextEvent.end;
      } else {
        currentCursor += minDurationMs; 
        fluidIndex++; // Fallback to avoid infinite loop
      }
    }
  }

  hardBlocks.forEach(hb => {
    scheduledTasks.push({
      ...hb,
      scheduledStart: hb.startTime!,
      scheduledEnd: hb.startTime! + (hb.estimatedDuration * 60000)
    });
  });

  scheduledTasks.sort((a, b) => a.scheduledStart - b.scheduledStart);

  return scheduledTasks;
};
