
export enum PriorityLevel {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Goal {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  name: string;
  deadline: number; // timestamp (start time for auto-complete logic)
  hasTime?: boolean; // Whether the task has a specific time deadline
  estimatedDuration: number; // ideal duration in minutes
  minDuration?: number; // minimum acceptable duration in minutes (for fluid blocks)
  isHardBlock?: boolean; // true if this is a fixed event (e.g., meeting at 2 PM)
  startTime?: number; // timestamp for when a hard block strictly begins
  priority: PriorityLevel;
  isImportant: boolean;
  isCompleted: boolean;
  createdAt: number;
  completedAt?: number; // timestamp
  recurrence?: RecurrenceType;
  goalId?: string;
  isProjection?: boolean; 
  isAutoCompletable?: boolean; // Task completes automatically after duration
  notes?: string; // Additional context for the task
  contributionLevel?: number; // 1-10 scale of how essential this task is to the goal
  canceledDates?: number[]; // timestamps of canceled dates
}

export interface ScheduledTask extends Task {
  scheduledStart: number;
  scheduledEnd: number;
  isCompressed?: boolean; // True if the task was compressed below its ideal duration
}

export enum UrgencyLevel {
  CRITICAL = 'critical',
  URGENT = 'urgent',
  SAFE = 'safe',
  OVERDUE = 'overdue'
}

export interface UrgencyInfo {
  score: number;
  level: UrgencyLevel;
  remainingTimeFormatted: string;
}

export interface NudgeState {
  taskId: string;
  taskName: string;
  type: 'threshold_crossed' | 'high_priority';
}
