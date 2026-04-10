import { Task, UrgencyLevel } from "./types";

/**
 * Generates a tough-love "SPAM" nudge by calling our secure Vercel API.
 */
export const generateNudgeMessage = async (taskName: string, urgencyLevel: UrgencyLevel): Promise<string> => {
  try {
    const response = await fetch('/api/nudge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskName, urgencyLevel })
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    return data.nudge;
  } catch (error) {
    console.error("Frontend Nudge fetch error:", error);
    return "Action is the only variable that matters. Move.";
  }
};

/**
 * Temporarily bypassed until the /api/insight backend route is created.
 */
export const getDailyInsight = async (tasks: Task[]): Promise<string> => {
  if (tasks.length === 0) return "The queue is empty. Awaiting task parameters.";
  return "Focus on the highest urgency node and ignore all distractions.";
};

/**
 * Temporarily bypassed until the /api/optimize backend route is created.
 */
export const getSchedulingOptimization = async (tasks: Task[]): Promise<string> => {
  const incompleteTasks = tasks.filter(t => !t.isCompleted);
  if (incompleteTasks.length === 0) return "Execution queue is nominal. No optimization required.";
  return "Strategic link offline. Proceed with manual execution based on urgency markers.";
};