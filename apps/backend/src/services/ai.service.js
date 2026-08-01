import Groq from 'groq-sdk';
import { env } from '../config/env.js';
import { AppError } from '../middleware/error.middleware.js';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

export const aiService = {
  async getHint(problemTitle, userCode, userMessage, language) {
    try {
      const prompt = `You are a helpful coding assistant for the problem "${problemTitle}".
Language being used: ${language}

User's current code:
\`\`\`${language}
${userCode || '(no code written yet)'}
\`\`\`

User's question: ${userMessage}

Rules:
- Give a concise, helpful hint.
- Do NOT reveal the full solution.
- Guide their thinking, point to the right approach or data structure.
- Use markdown formatting for code snippets.
- If the code has a clear bug, point to the line area without fixing it for them.`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: MODEL,
      });

      return chatCompletion.choices[0]?.message?.content || '';
    } catch (err) {
      console.error('Groq Hint Error:', err);
      throw new AppError('AI service temporarily unavailable', 502);
    }
  },

  async explainCode(code, language) {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: `Explain this ${language} code clearly and in-depth, breaking down how it works line-by-line or block-by-block. Use markdown to format the explanation beautifully:\n\`\`\`${language}\n${code}\n\`\`\`` }],
        model: MODEL,
      });
      return chatCompletion.choices[0]?.message?.content || '';
    } catch (err) {
      console.error('Groq Explain Error:', err);
      throw new AppError('AI service temporarily unavailable', 502);
    }
  },

  async reviewCode(code, language, problemTitle) {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: `Review this ${language} solution for "${problemTitle}". Comment on time complexity, space complexity, and any improvements. Be concise but insightful. Use markdown:\n\`\`\`${language}\n${code}\n\`\`\`` }],
        model: MODEL,
      });
      return chatCompletion.choices[0]?.message?.content || '';
    } catch (err) {
      console.error('Groq Review Error:', err);
      throw new AppError('AI service temporarily unavailable', 502);
    }
  },

  async getSolution(problemTitle, userCode, language) {
    try {
      const prompt = `You are an expert ${language} engineer. Provide a complete, optimal, and well-commented solution for the coding problem "${problemTitle}". 
Language requested: ${language}

If the user provided partial code, you may point out where they went wrong, but your primary goal is to provide the full, correct solution. 

Format your response in Markdown, wrapping the solution in a \`\`\`${language} block, and provide a brief explanation of the time and space complexity.
User's partial code for context (if any):
\`\`\`${language}
${userCode || '(no code written yet)'}
\`\`\`
`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: MODEL,
      });

      return chatCompletion.choices[0]?.message?.content || '';
    } catch (err) {
      console.error('Groq Solution Error:', err);
      throw new AppError('AI service temporarily unavailable', 502);
    }
  },

  async chat(messages, problemTitle, userCode, language) {
    try {
      const systemPrompt = `You are CodeSach AI, an expert coding assistant embedded in a competitive programming platform.
${problemTitle ? `Current problem: "${problemTitle}"` : 'No specific problem selected.'}
${userCode ? `User's current code (${language}):\n\`\`\`${language}\n${userCode}\n\`\`\`` : ''}

You help users:
- Understand problem requirements
- Debug their code
- Learn algorithms and data structures
- Get hints without giving full solutions (unless asked)
- Review code complexity and optimizations

Always be concise, educational, and use markdown for code blocks.`;

      const chatHistory = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatHistory,
        ],
        model: MODEL,
        temperature: 0.7,
        max_tokens: 1024,
      });

      return chatCompletion.choices[0]?.message?.content || 'No response generated.';
    } catch (err) {
      console.error('Groq Chat Error:', err);
      throw new AppError('AI service temporarily unavailable', 502);
    }
  },
};