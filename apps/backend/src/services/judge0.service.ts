import { env } from '../config/env';
import { AppError } from '../middleware/error.middleware';

export const LANGUAGE_IDS: Record<string, number> = {
  cpp: 54,
  java: 62,
  python: 71,
  javascript: 63,
  c: 50,
};

interface Judge0Result {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: { id: number; description: string };
  time: string | null;
  memory: number | null;
}

const HEADERS = { 'Content-Type': 'application/json' };

async function submitOne(code: string, languageId: number, stdin: string): Promise<Judge0Result> {
  // wait=true works fine against a self-hosted instance since there's no per-request rate cap
  const res = await fetch(`${env.JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      source_code: code,
      language_id: languageId,
      stdin,
      cpu_time_limit: 2,
      memory_limit: 128000,
    }),
  });

  if (!res.ok) throw new AppError('Judge0 submission failed', 502);
  return res.json() as Promise<Judge0Result>;
}

export const judge0Service = {
  async runTests(code: string, language: string, testCases: { input: string; expectedOutput: string; isHidden: boolean }[]) {
    const languageId = LANGUAGE_IDS[language];
    if (!languageId) throw new AppError('Unsupported language', 400);

    // Run test cases in parallel — self-hosted instance has its own worker pool, no external rate limit
    const settled = await Promise.all(
      testCases.map((tc) => submitOne(code, languageId, tc.input)),
    );

    return settled.map((result, i) => {
      const tc = testCases[i];
      const actual = (result.stdout ?? '').trim();
      const expected = tc.expectedOutput.trim();
      const passed = result.status.id === 3 && actual === expected; // 3 = Accepted

      return {
        passed,
        input: tc.isHidden ? '(hidden)' : tc.input,
        expected: tc.isHidden ? '(hidden)' : expected,
        actual: tc.isHidden && !passed ? '(hidden)' : actual,
        runtime: parseFloat(result.time ?? '0'),
        error: result.stderr || result.compile_output || null,
        statusDescription: result.status.description,
      };
    });
  },
};
