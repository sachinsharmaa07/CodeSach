import { Groq } from 'groq-sdk';
import { env } from '../config/env.js';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

/**
 * Get a hint for a programming problem
 */
export async function getHint(problemTitle, userCode, message, language) {
  if (!env.GROQ_API_KEY) {
    return 'AI features are currently disabled because GROQ_API_KEY is not configured in the environment.';
  }

  const prompt = `You are an expert AI programming assistant. 
${problemTitle ? `The user is currently working on the problem "${problemTitle}".\n` : ''}
${userCode ? `Their current code in ${language} is:\n\`\`\`${language}\n${userCode}\n\`\`\`\n` : ''}

User Message: "${message}"

Provide a helpful, detailed response. If the user asks for code, provide it cleanly formatted in markdown code blocks.`;

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_completion_tokens: 500,
    });
    return response.choices[0]?.message?.content || 'I could not generate a hint right now.';
  } catch (error) {
    console.error('Groq AI Error:', error);
    throw new Error('AI Service failed to generate a response.', { cause: error });
  }
}

/**
 * Generate Problem Description, Test Cases, and Starter Code
 */
export async function generateProblemDetails(title) {
  if (!env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is missing. Cannot generate problem details.');
  }

  const prompt = `You are a technical content creator for a LeetCode-style platform. Generate the problem details for the data structure and algorithm problem: "${title}".

Return ONLY a valid JSON object matching this exact schema, with NO extra markdown formatting outside the JSON, NO codeblock backticks (do not wrap in \`\`\`json), just the raw JSON object string:

{
  "description": "The full problem description in Markdown format. Include problem statement, rules, constraints explanation, and examples.",
  "testCases": [
    {
      "input": "String representation of inputs separated by newline (e.g. '[2,7,11,15]\\n9')",
      "expectedOutput": "String representation of expected output (e.g. '[0,1]')",
      "isHidden": boolean (make 2 visible, 3 hidden)
    }
  ],
    }
  ],
  "parameters": [
    { "name": "nums", "type": "integer array", "description": "Input array containing integers" },
    { "name": "target", "type": "integer", "description": "Target sum" }
  ],
  "returnValue": {
    "type": "integer array",
    "description": "Indices of the two numbers"
  },
  "aiSolutions": {
    "bruteForce": "Explanation and code for brute force approach...",
    "better": "Explanation and code for better approach...",
    "optimal": "Explanation and optimal code approach..."
  }
  }
}

Make sure there are at least 5 test cases. Ensure parameters are correctly typed (integer, string, boolean, integer array, string array). Return the exact JSON structure specified above.`;

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Groq Generate Error:', error);
    throw new Error('Failed to generate problem details.', { cause: error });
  }
}

/**
 * Generate a direct solution for a problem
 */
export async function generateSolution(problemTitle, language) {
  if (!env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is missing. Cannot generate solution.');
  }

  const prompt = `You are an expert AI programming assistant. The user wants the solution for the data structure and algorithm problem: "${problemTitle}".
Please provide a highly detailed explanation and the optimal solution code in ${language}. 
Use markdown formatting. Include:
1. **Intuition & Approach**: Explain the optimal approach.
2. **Time & Space Complexity**: Detail the complexity.
3. **Code**: Provide the clean, well-commented optimal code snippet in ${language}.`;

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_completion_tokens: 1000,
    });
    return response.choices[0]?.message?.content || 'I could not generate a solution right now.';
  } catch (error) {
    console.error('Groq Solution Error:', error);
    throw new Error('AI Service failed to generate a solution.', { cause: error });
  }
}
