import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize AI securely. Because this runs on the server, 
// process.env works perfectly and your key is hidden from the browser.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { taskName, urgencyLevel } = req.body;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a tough-love productivity coach. Generate a 1-sentence punchy nudge for a task named "${taskName}" which is currently at "${urgencyLevel}" urgency. Use "SPAM" (Stop Planning, Act More) philosophy. No emojis. Tone: Gritty, direct.`,
      config: {
        temperature: 0.8,
      },
    });
    
    // Send the generated text back to your React frontend
    res.status(200).json({ nudge: response.text?.trim() || "The engine demands action. Start now." });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: 'Failed to generate nudge' });
  }
}