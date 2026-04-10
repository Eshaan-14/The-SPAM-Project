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

// You will apply this exact same fetch() pattern to getDailyInsight 
// and getSchedulingOptimization by making corresponding files in your /api folder!