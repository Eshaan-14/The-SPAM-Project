
import { GoogleGenAI } from "@google/genai";
import { Task, UrgencyLevel } from "./types";

// Initialize AI with the standard environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Generates a tough-love "SPAM" nudge for a specific task.
 */
export const generateNudgeMessage = async (taskName: string, urgencyLevel: UrgencyLevel): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a tough-love productivity coach. Generate a 1-sentence punchy nudge for a task named "${taskName}" which is currently at "${urgencyLevel}" urgency. Use "SPAM" (Stop Planning, Act More) philosophy. No emojis. Tone: Gritty, direct.`,
      config: {
        temperature: 0.8,
      },
    });
    return response.text?.trim() || "The engine demands action. Start now.";
  } catch (error) {
    console.error("AI Nudge error:", error);
    return "Action is the only variable that matters. Move.";
  }
};

/**
 * Provides a daily strategic insight based on the current task list.
 */
export const getDailyInsight = async (tasks: Task[]): Promise<string> => {
  if (tasks.length === 0) return "The queue is empty. Awaiting task parameters.";
  
  const incomplete = tasks.filter(t => !t.isCompleted);
  const taskSummary = incomplete.map(t => `${t.name} (${t.priority})`).join(", ");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `System status check. User has these tasks: ${taskSummary}. Provide a 1-sentence high-level strategic priority for today using the "Stop Planning, Act More" philosophy. Focus on bypassing paralysis.`,
    });
    return response.text?.trim() || "Focus on the highest urgency node and ignore all distractions.";
  } catch (error) {
    return "Execute the most critical path immediately.";
  }
};

/**
 * Uses Gemini Pro to optimize the entire schedule and find danger zones.
 */
export const getSchedulingOptimization = async (tasks: Task[]): Promise<string> => {
  const incompleteTasks = tasks.filter(t => !t.isCompleted);
  if (incompleteTasks.length === 0) return "Execution queue is nominal. No optimization required.";

  const taskData = incompleteTasks.map(t => ({
    name: t.name,
    deadline: new Date(t.deadline).toLocaleString(),
    duration: `${t.estimatedDuration} mins`,
    priority: t.priority
  }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are the SPAM Strategic Engine. Current Time: ${new Date().toLocaleString()}. 
      Analyze these task parameters: ${JSON.stringify(taskData)}.
      
      Requirements:
      1. Identify the 'Critical Path' - the sequence that avoids any failed deadlines.
      2. Flag 'Collision Risks' where estimated durations exceed available time windows.
      3. The 'SPAM Verdict': One task to start in the next 60 seconds and exactly why.
      
      Format with clear Markdown headers (# Header) and bullet points. 
      Tone: Analytical, authoritative, decision-focused.
      CRITICAL CONSTRAINT: Limit output to maximum 10 lines of text. Be extremely concise.`,
      config: {
        thinkingConfig: { thinkingBudget: 16384 }
      }
    });
    return response.text?.trim() || "Engine timeout. Reverting to urgency-score default logic.";
  } catch (error) {
    console.error("Optimization error:", error);
    return "Strategic link offline. Proceed with manual execution based on urgency markers.";
  }
};
