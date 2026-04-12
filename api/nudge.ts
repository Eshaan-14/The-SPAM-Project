import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { taskName, urgencyLevel } = req.body;
    
    // "as string" forces TypeScript to stop panicking about undefined variables
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const prompt = `You are a strict, no-nonsense productivity AI for the "SPAM" (Stop Planning, Act More) app. 
    The user has a task: "${taskName}" with an urgency level of "${urgencyLevel}". 
    Give them a brutal, one-sentence tough-love nudge to stop procrastinating and start working. Do not be polite.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.status(200).json({ nudge: text.trim() });

  } catch (error) {
    console.error("Backend AI Error:", error);
    return res.status(500).json({ error: 'Failed to generate insight.' });
  }
}