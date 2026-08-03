import { env } from '../config/env.js';
import { AppError } from '../middleware/error.middleware.js';
import { spawn } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { randomUUID } from 'crypto';

export const LANGUAGE_IDS = {
  cpp: 54,
  java: 62,
  python: 71,
  javascript: 63,
  c: 50,
  go: 60,
  rust: 73,
  kotlin: 78,
  swift: 83,
};

// ─── Judge0 (when available) ─────────────────────────────────────────────────
async function submitOneJudge0(fullCode, languageId, stdin) {
  const res = await fetch(`${env.JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source_code: fullCode,
      language_id: languageId,
      stdin,
      cpu_time_limit: 3,
      memory_limit: 131072,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error('Judge0 failed');
  return res.json();
}

// ─── Judge0 availability cache ───────────────────────────────────────────────
let judge0Available = null;
let judge0LastCheck = 0;
async function isJudge0Available() {
  const now = Date.now();
  if (now - judge0LastCheck < 60000 && judge0Available !== null) return judge0Available;
  try {
    // Test with a real execution (Bash echo) — /about alone doesn't mean workers are up
    const res = await fetch(`${env.JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_code: 'echo ok', language_id: 46, stdin: '' }),
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      judge0Available = data.status?.id === 3 && (data.stdout ?? '').trim() === 'ok';
    } else {
      judge0Available = false;
    }
  } catch {
    judge0Available = false;
  }
  judge0LastCheck = now;
  console.info(
    `[Judge0] workers ${judge0Available ? 'UP ✅' : 'DOWN ❌'} — using ${judge0Available ? 'Judge0' : 'local executor'}`,
  );
  return judge0Available;
}

// ─── Local executor: JS, Python, C++, Java ───────────────────────────────────
function spawnRun(cmd, args, stdin, timeout = 5000) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '',
      stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
    }, timeout);
    child.stdout.on('data', (d) => {
      stdout += d.toString();
    });
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code === null) resolve({ ok: false, timedOut: true, stdout, stderr });
      else resolve({ ok: code === 0, stdout, stderr });
    });
    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ ok: false, stdout: '', stderr: err.message });
    });
    if (stdin) {
      child.stdin.write(stdin);
    }
    child.stdin.end();
  });
}

function runLocal(language, fullCode, stdin) {
  return new Promise((resolve) => {
    (async () => {
      const id = randomUUID();
      const dir = tmpdir();
      const success = (stdout) =>
        resolve({ stdout, stderr: '', status: { id: 3, description: 'Accepted' }, time: '0.1' });
      const rte = (stderr) =>
        resolve({
          stdout: '',
          stderr,
          status: { id: 11, description: 'Runtime Error' },
          time: '0',
        });
      const tle = () =>
        resolve({
          stdout: '',
          stderr: 'Time Limit Exceeded',
          status: { id: 5, description: 'Time Limit Exceeded' },
          time: '5',
        });
      const ce = (stderr) =>
        resolve({
          stdout: '',
          stderr,
          status: { id: 6, description: 'Compilation Error' },
          time: '0',
        });

      try {
        if (language === 'javascript') {
          const file = join(dir, `${id}.js`);
          await writeFile(file, fullCode, 'utf8');
          const r = await spawnRun('node', [file], stdin);
          unlink(file).catch(() => {});
          if (r.timedOut) return tle();
          return r.ok ? success(r.stdout) : rte(r.stderr);
        } else if (language === 'python') {
          const file = join(dir, `${id}.py`);
          await writeFile(file, fullCode, 'utf8');
          const r = await spawnRun('python3', [file], stdin);
          unlink(file).catch(() => {});
          if (r.timedOut) return tle();
          return r.ok ? success(r.stdout) : rte(r.stderr);
        } else if (language === 'cpp') {
          const src = join(dir, `${id}.cpp`);
          const bin = join(dir, id);
          await writeFile(src, fullCode, 'utf8');
          // Compile
          const comp = await spawnRun('g++', ['-O2', '-o', bin, src], '', 15000);
          unlink(src).catch(() => {});
          if (!comp.ok) {
            unlink(bin).catch(() => {});
            return ce(comp.stderr);
          }
          // Run
          const r = await spawnRun(bin, [], stdin);
          unlink(bin).catch(() => {});
          if (r.timedOut) return tle();
          return r.ok ? success(r.stdout) : rte(r.stderr);
        } else if (language === 'java') {
          // Java class name must match filename; use "Solution" as fixed class name
          const srcDir = join(dir, id);
          const { mkdir } = await import('fs/promises');
          await mkdir(srcDir, { recursive: true });
          const src = join(srcDir, 'Solution.java');
          // Wrap user code into a class if not already wrapped
          const wrapped = fullCode.includes('class Solution')
            ? fullCode
            : `public class Solution {\n${fullCode}\n}`;
          await writeFile(src, wrapped, 'utf8');
          // Compile
          const comp = await spawnRun('javac', [src], '', 15000);
          if (!comp.ok) {
            return ce(comp.stderr);
          }
          // Run
          const r = await spawnRun('java', ['-cp', srcDir, 'Solution'], stdin);
          if (r.timedOut) return tle();
          return r.ok ? success(r.stdout) : rte(r.stderr);
        } else if (language === 'c') {
          const src = join(dir, `${id}.c`);
          const bin = join(dir, id);
          await writeFile(src, fullCode, 'utf8');
          const comp = await spawnRun('gcc', ['-O2', '-o', bin, src], '', 15000);
          unlink(src).catch(() => {});
          if (!comp.ok) {
            unlink(bin).catch(() => {});
            return ce(comp.stderr);
          }
          const r = await spawnRun(bin, [], stdin);
          unlink(bin).catch(() => {});
          if (r.timedOut) return tle();
          return r.ok ? success(r.stdout) : rte(r.stderr);
        } else if (language === 'go') {
          const src = join(dir, `${id}.go`);
          await writeFile(src, fullCode, 'utf8');
          const r = await spawnRun('go', ['run', src], stdin);
          unlink(src).catch(() => {});
          if (r.timedOut) return tle();
          return r.ok ? success(r.stdout) : rte(r.stderr);
        } else if (language === 'rust') {
          const src = join(dir, `${id}.rs`);
          const bin = join(dir, id);
          await writeFile(src, fullCode, 'utf8');
          const comp = await spawnRun('rustc', [src, '-o', bin], '', 15000);
          unlink(src).catch(() => {});
          if (!comp.ok) {
            unlink(bin).catch(() => {});
            return ce(comp.stderr);
          }
          const r = await spawnRun(bin, [], stdin);
          unlink(bin).catch(() => {});
          if (r.timedOut) return tle();
          return r.ok ? success(r.stdout) : rte(r.stderr);
        } else if (language === 'kotlin') {
          const src = join(dir, `${id}.kt`);
          const bin = join(dir, `${id}.jar`);
          await writeFile(src, fullCode, 'utf8');
          const comp = await spawnRun('kotlinc', [src, '-include-runtime', '-d', bin], '', 15000);
          unlink(src).catch(() => {});
          if (!comp.ok) {
            unlink(bin).catch(() => {});
            return ce(comp.stderr);
          }
          const r = await spawnRun('java', ['-jar', bin], stdin);
          unlink(bin).catch(() => {});
          if (r.timedOut) return tle();
          return r.ok ? success(r.stdout) : rte(r.stderr);
        } else if (language === 'swift') {
          const src = join(dir, `${id}.swift`);
          await writeFile(src, fullCode, 'utf8');
          const r = await spawnRun('swift', [src], stdin);
          unlink(src).catch(() => {});
          if (r.timedOut) return tle();
          return r.ok ? success(r.stdout) : rte(r.stderr);
        } else {
          return resolve({
            stdout: '',
            stderr: `Language "${language}" is not supported.`,
            status: { id: 13, description: 'Internal Error' },
            time: '0',
            _noDocker: true,
          });
        }
      } catch (err) {
        resolve({
          stdout: '',
          stderr: err.message,
          status: { id: 11, description: 'Runtime Error' },
          time: '0',
        });
      }
    })();
  });
}

// ─── Wrap user function body into a full runnable program ────────────────────
//
// The DB stores:
//   starterCode[lang]  → only the FUNCTION BODY template (what user edits)
//   harness[lang]      → the I/O wrapper that calls the function
//
// If there's no harness in the problem (legacy), run the code as-is.
//
function buildFullCode(language, userCode, harness) {
  if (harness) {
    // Harness-based: replace placeholder with user's function body
    return harness.replace('{{USER_CODE}}', userCode);
  }

  // Legacy / no harness: augment code by language
  if (language === 'cpp') {
    // Auto-prepend standard headers if missing
    // NOTE: bits/stdc++.h is GCC-only; use standard headers for macOS clang compatibility
    const hasInclude = userCode.includes('#include');
    const prefix = hasInclude
      ? ''
      : '#include <iostream>\n#include <vector>\n#include <map>\n#include <unordered_map>\n#include <set>\n#include <string>\n#include <algorithm>\n#include <numeric>\n#include <queue>\n#include <stack>\n#include <climits>\n#include <sstream>\nusing namespace std;\n\n';
    return prefix + userCode;
  }

  if (language === 'java') {
    // Auto-wrap in Solution class if needed
    if (!userCode.includes('class Solution') && !userCode.includes('public static void main')) {
      return 'import java.util.*;\npublic class Solution {\n' + userCode + '\n}';
    }
    return userCode;
  }

  return userCode;
}

// ─── Main service ─────────────────────────────────────────────────────────────
export const judge0Service = {
  async runTests(userCode, language, testCases, harness = null) {
    const languageId = LANGUAGE_IDS[language];
    if (!languageId) throw new AppError('Unsupported language', 400);

    const fullCode = buildFullCode(language, userCode, harness);
    const useJudge0 = await isJudge0Available();

    const results = [];

    for (const tc of testCases) {
      let result;
      try {
        result = useJudge0
          ? await submitOneJudge0(fullCode, languageId, tc.input)
          : await runLocal(language, fullCode, tc.input);
      } catch {
        result = await runLocal(language, fullCode, tc.input);
      }

      const actual = (result.stdout ?? '').trim();
      const expected = (tc.expectedOutput ?? '').trim();
      const sid = result.status?.id;

      let passed = false;
      let error = null;

      if (result._noDocker) {
        error = `⚠️ ${language.toUpperCase()} requires Docker/Judge0. Switch to JavaScript or Python.`;
      } else if (sid === 3) {
        passed = actual === expected;
        // No error msg when it's just wrong answer — show diff instead
      } else {
        // Compile error, runtime error, TLE, etc.
        error = (
          result.stderr ||
          result.compile_output ||
          result.status?.description ||
          'Error'
        ).trim();
        if (error.length > 400) error = error.slice(0, 400) + '…';
      }

      results.push({
        passed,
        input: tc.isHidden ? '(hidden)' : tc.input,
        expected: tc.isHidden ? '(hidden)' : expected,
        actual: tc.isHidden && !passed ? '(hidden)' : actual,
        runtime: parseFloat(result.time ?? '0'),
        error,
        statusDescription: result.status?.description || 'Unknown',
      });
    }

    return results;
  },
};
