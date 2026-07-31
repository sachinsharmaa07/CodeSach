import { Submission } from '../models/submission.model';
import { Problem } from '../models/problem.model';
import { User } from '../models/user.model';
import { judge0Service, LANGUAGE_IDS } from './judge0.service';
import { AppError } from '../middleware/error.middleware';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function isYesterday(dateStr: string) {
  const d = new Date(dateStr);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return d.toISOString().slice(0, 10) === y.toISOString().slice(0, 10);
}

export const submissionService = {
  async run(userId: string, problemId: string, code: string, language: string) {
    const problem = await Problem.findById(problemId);
    if (!problem) throw new AppError('Problem not found', 404);

    const visibleCases = problem.testCases.filter((tc) => !tc.isHidden).slice(0, 3);
    return judge0Service.runTests(code, language, visibleCases);
  },

  async submit(userId: string, problemId: string, code: string, language: string) {
    const problem = await Problem.findById(problemId);
    if (!problem) throw new AppError('Problem not found', 404);
    if (!LANGUAGE_IDS[language]) throw new AppError('Unsupported language', 400);

    const results = await judge0Service.runTests(code, language, problem.testCases);
    const allPassed = results.every((r) => r.passed);
    const maxRuntime = Math.max(...results.map((r) => r.runtime), 0);

    let status: 'accepted' | 'wrong_answer' | 'runtime_error' | 'compile_error' = 'wrong_answer';
    if (allPassed) status = 'accepted';
    else if (results.some((r) => r.statusDescription === 'Compilation Error')) status = 'compile_error';
    else if (results.some((r) => /Runtime Error/.test(r.statusDescription))) status = 'runtime_error';

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    let marksAwarded = 0;
    const alreadySolved = user.solvedProblems.some((p: any) => p.toString() === problemId);

    if (allPassed) {
      problem.acceptedSubmissions += 1;

      if (!alreadySolved) {
        marksAwarded = problem.marks;
        user.totalScore += marksAwarded;
        user.solvedProblems.push(problem._id as any);

        const today = todayStr();
        const last = user.streak.lastSolvedDate ? new Date(user.streak.lastSolvedDate).toISOString().slice(0, 10) : null;

        if (last !== today) {
          user.streak.current = last && isYesterday(last) ? user.streak.current + 1 : 1;
          user.streak.longest = Math.max(user.streak.longest, user.streak.current);
          user.streak.lastSolvedDate = new Date();
        }
      }

      const today = todayStr();
      const entry = user.dailyActivity.find((d: any) => d.date === today);
      if (entry) entry.count += 1;
      else user.dailyActivity.push({ date: today, count: 1 });
    }

    problem.totalSubmissions += 1;
    await problem.save();
    await user.save();

    const submission = await Submission.create({
      user: userId,
      problem: problemId,
      code,
      language,
      languageId: LANGUAGE_IDS[language],
      status,
      runtime: maxRuntime,
      marksAwarded,
      testResults: results.map(({ passed, input, expected, actual, runtime }) => ({ passed, input, expected, actual, runtime })),
    });

    return { submission, allPassed, marksAwarded, streak: user.streak, results };
  },
};
