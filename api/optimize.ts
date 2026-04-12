import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { tasks } = req.body;
    
    // "as string" fixes the undefined error
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are the ruthless, highly efficient AI execution engine for the "SPAM" (Stop Planning, Act More) app.
    The user has these pending tasks: ${JSON.stringify(tasks)}.

    Your job is to dictate their exact execution order. 
    Do not be polite. Do not give general advice. 
    Format your response in Markdown using bullet points, bold text for urgency, and dictate exactly what they should do first, second, and third based on urgency. Keep it under 4 sentences.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.status(200).json({ suggestion: text });

  } catch (error) {
    console.error("Optimize AI Error:", error);
    return res.status(500).json({ error: 'AI processing failed' });
  }
}