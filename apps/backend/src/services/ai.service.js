import { Groq } from 'groq-sdk';
import { env } from '../config/env.js';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

/**
 * Get a hint for a programming problem
 */
export async function getHint(problemTitle, userCode, message, language) {
  const prompt = `You are an expert AI programming assistant. The user is solving the problem "${problemTitle}".
Their current code in ${language} is:
\`\`\`${language}
${userCode}
\`\`\`

The user is asking: "${message}"

Provide a concise, helpful hint without writing the full solution for them. Keep it brief and encouraging. Use markdown for code formatting.`;

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
  "starterCode": {
    "javascript": "function problemName(arg1, arg2) {\\n  // Write your code here\\n}",
    "java": "class Solution {\\n    public ReturnType problemName(Type1 arg1, Type2 arg2) {\\n        // Write your code here\\n    }\\n}",
    "cpp": "class Solution {\\npublic:\\n    ReturnType problemName(Type1 arg1, Type2 arg2) {\\n        // Write your code here\\n    }\\n};",
    "c": "ReturnType problemName(Type1 arg1, Type2 arg2) {\\n    // Write your code here\\n}"
  },
  "harness": {
    "javascript": "const fs = require('fs');\\n{{USER_CODE}}\\nconst input = fs.readFileSync('/dev/stdin', 'utf-8').trim().split('\\\\n');\\nconsole.log(JSON.stringify(problemName(JSON.parse(input[0]))));",
    "java": "import java.util.*;\\nimport java.io.*;\\n{{USER_CODE}}\\npublic class Main {\\n    public static void main(String[] args) throws Exception {\\n        Scanner sc = new Scanner(System.in);\\n        // Read stdin, instantiate Solution, call method, print result\\n    }\\n}",
    "cpp": "#include <iostream>\\n#include <vector>\\nusing namespace std;\\n{{USER_CODE}}\\nint main() {\\n    // Read stdin, instantiate Solution, call method, print result\\n    return 0;\\n}",
    "c": "#include <stdio.h>\\n#include <stdlib.h>\\n{{USER_CODE}}\\nint main() {\\n    // Read stdin, call method, print result\\n    return 0;\\n}"
  },
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

Make sure there are at least 5 test cases. Ensure starterCode has the PROPER and exact LeetCode-style function signatures (names, return types, and arguments based on the specific problem context). Do NOT use generic placeholders like "solution()".
The \`harness\` MUST correctly parse the \`tc.input\` format you generate, call the user's function from \`starterCode\`, and print the result. Replace \`problemName\` in the harness with the exact function name you used in starterCode!`;

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
