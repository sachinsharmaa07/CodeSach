import { Submission } from '../models/submission.model.js';
import { Problem } from '../models/problem.model.js';
import { User } from '../models/user.model.js';
import { judge0Service, LANGUAGE_IDS } from './judge0.service.js';
import { AppError } from '../middleware/error.middleware.js';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function isYesterday(dateStr) {
  const d = new Date(dateStr);
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return d.toISOString().slice(0, 10) === y.toISOString().slice(0, 10);
}

export const submissionService = {
  async run(userId, problemId, code, language) {
    const problem = await Problem.findById(problemId).lean();
    if (!problem) throw new AppError('Problem not found', 404);
    const visibleCases = problem.testCases.filter((tc) => !tc.isHidden).slice(0, 3);
    const harness = problem.harness?.[language] || null;
    return judge0Service.runTests(code, language, visibleCases, harness);
  },

  async submit(userId, problemId, code, language) {
    const problem = await Problem.findById(problemId);
    if (!problem) throw new AppError('Problem not found', 404);
    if (!LANGUAGE_IDS[language]) throw new AppError('Unsupported language', 400);

    const harness = problem.harness?.get ? problem.harness.get(language) : problem.harness?.[language];
    const results = await judge0Service.runTests(code, language, problem.testCases, harness || null);
    const allPassed = results.every((r) => r.passed);
    const maxRuntime = Math.max(...results.map((r) => r.runtime), 0);

    let status = 'wrong_answer';
    if (allPassed) status = 'accepted';
    else if (results.some((r) => r.statusDescription === 'Compilation Error')) status = 'compile_error';
    else if (results.some((r) => /Runtime Error/.test(r.statusDescription))) status = 'runtime_error';

    let marksAwarded = 0;

    if (allPassed) {
      problem.acceptedSubmissions += 1;

      const firstSolveResult = await User.findOneAndUpdate(
        { _id: userId, solvedProblems: { $ne: problem._id } },
        { $addToSet: { solvedProblems: problem._id }, $inc: { totalScore: problem.marks } },
        { new: false },
      );

      if (firstSolveResult) {
        marksAwarded = problem.marks;
        const today = todayStr();
        const last = firstSolveResult.streak.lastSolvedDate
          ? new Date(firstSolveResult.streak.lastSolvedDate).toISOString().slice(0, 10)
          : null;
        const nextCurrent = last === today ? firstSolveResult.streak.current
          : (last && isYesterday(last) ? firstSolveResult.streak.current + 1 : 1);
        const nextLongest = Math.max(firstSolveResult.streak.longest, nextCurrent);

        await User.updateOne(
          { _id: userId },
          { $set: { 'streak.current': nextCurrent, 'streak.longest': nextLongest, 'streak.lastSolvedDate': new Date() } },
        );
      }

      const today = todayStr();
      const incResult = await User.updateOne(
        { _id: userId, 'dailyActivity.date': today },
        { $inc: { 'dailyActivity.$.count': 1 } },
      );
      if (incResult.matchedCount === 0) {
        await User.updateOne({ _id: userId }, { $push: { dailyActivity: { date: today, count: 1 } } });
      }
    }

    problem.totalSubmissions += 1;
    await problem.save();

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

    const freshUser = await User.findById(userId).select('streak').lean();

    return { submission, allPassed, marksAwarded, streak: freshUser.streak, results };
  },
};