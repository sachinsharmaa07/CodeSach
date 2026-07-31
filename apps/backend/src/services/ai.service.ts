import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { AppError } from '../middleware/error.middleware';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export const aiService = {
  async getHint(
    problemTitle: string,
    userCode: string,
    userMessage: string,
    language: string,
  ): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a helpful coding assistant for the problem "${problemTitle}".
Language being used: ${language}

User's current code:
\`\`\`${language}
${userCode || '(no code written yet)'}
\`\`\`

User's question: ${userMessage}

Rules:
- Give a concise, helpful hint (2-4 sentences max)
- Do NOT reveal the full solution
- Guide their thinking, point to the right approach or data structure
- If the code has a clear bug, point to the line area without fixing it for them`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch {
      throw new AppError('AI service temporarily unavailable', 502);
    }
  },

  async explainCode(code: string, language: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(
        `Explain this ${language} code briefly in simple terms (3-5 sentences):\n\`\`\`${language}\n${code}\n\`\`\``,
      );
      return result.response.text();
    } catch {
      throw new AppError('AI service temporarily unavailable', 502);
    }
  },

  async reviewCode(code: string, language: string, problemTitle: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(
        `Review this ${language} solution for "${problemTitle}". Comment on time complexity, space complexity, and any improvements. Be concise.\n\`\`\`${language}\n${code}\n\`\`\``,
      );
      return result.response.text();
    } catch {
      throw new AppError('AI service temporarily unavailable', 502);
    }
  },
};
