import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Terminal,
  RotateCcw,
  Bot,
  Lightbulb,
  BookOpen,
  Code2,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Badge } from '@/components/ui/Badge';
import { AiChat } from '@/components/AiChat';
import { problemApi, submissionApi } from '@/services/problem.service';
import { useThemeStore } from '@/store/theme.store';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import { cn } from '@/lib/utils';

const DEFAULT_CODE = {
  javascript: `// Write your solution here`,
  cpp: `// Write your solution here`,
  java: `// Write your solution here`,
  c: `// Write your solution here`,
};

const LANG_LABELS = {
  cpp: 'C++',
  javascript: 'JavaScript',
  java: 'Java',
  c: 'C',
};

export const ProblemDetail = () => {
  const { slug } = useParams();
  const { theme } = useThemeStore();
  const [problem, setProblem] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  // Tabs and Selections
  const [activeTab, setActiveTab] = useState('problem'); // 'problem' | 'testcases' | 'results' | 'ai'
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [selectedResultCase, setSelectedResultCase] = useState(0);

  // AI Chat & Solutions
  const [aiOpen, setAiOpen] = useState(false);
  const [initialAiMessage, setInitialAiMessage] = useState('');
  const [generatingSolution, setGeneratingSolution] = useState(false);
  const [generatedSolution, setGeneratedSolution] = useState(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    problemApi
      .getBySlug(slug)
      .then((res) => {
        const p = res.data.data.problem;
        setProblem(p);
        setIsSolved(res.data.data.isSolved || false);
        const starter = p.starterCode?.get
          ? p.starterCode.get(language) || p.starterCode[language]
          : p.starterCode?.[language];
        setCode(starter || DEFAULT_CODE[language]);
      })
      .catch(() => toast.error('Failed to load problem'))
      .finally(() => setLoading(false));
  }, [slug, language]);

  useEffect(() => {
    setSelectedTestCase(0);
    setSelectedResultCase(0);
  }, [activeTab, results]);

  const switchLanguage = (lang) => {
    setLanguage(lang);
    const starter = problem?.starterCode?.get
      ? problem.starterCode.get(lang) || problem.starterCode[lang]
      : problem?.starterCode?.[lang];
    setCode(starter || DEFAULT_CODE[lang]);
    setResults(null);
  };

  const handleRun = async () => {
    if (!problem) return;
    setRunning(true);
    setResults(null);
    setActiveTab('results');
    try {
      const res = await submissionApi.run({ problemId: problem._id, code, language });
      setResults(res.data.data.results);
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Run failed');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setSubmitting(true);
    setResults(null);
    setActiveTab('results');
    try {
      const res = await submissionApi.submit({ problemId: problem._id, code, language });
      const { allPassed, marksAwarded, streak, results: r } = res.data.data;
      setResults(r);
      if (allPassed) {
        setIsSolved(true);
        toast.success(
          marksAwarded > 0
            ? `✅ Accepted! +${marksAwarded} marks · Streak: ${streak.current}🔥`
            : '✅ Accepted! (already solved)',
        );
      } else {
        toast.error(`❌ ${r.filter((x) => !x.passed).length} test case(s) failed`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetCode = () => {
    if (window.confirm('Are you sure you want to reset your code? This cannot be undone.')) {
      const starter = problem?.starterCode?.get
        ? problem.starterCode.get(language) || problem.starterCode[language]
        : problem?.starterCode?.[language];
      setCode(starter || DEFAULT_CODE[language]);
      toast.success('Code reset to default');
    }
  };

  const triggerAi = (msg) => {
    setInitialAiMessage(msg);
    setAiOpen(true);
  };

  const handleGenerateSolution = async () => {
    if (!problem) return;
    setActiveTab('ai');
    if (problem.aiSolutions || generatedSolution) return; // already have a solution

    setGeneratingSolution(true);
    try {
      const res = await api.post('/ai/solution', {
        problemTitle: problem.title,
        language: language,
      });
      setGeneratedSolution(res.data.data.reply);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate solution');
    } finally {
      setGeneratingSolution(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-neutral-950 text-neutral-500 dark:text-neutral-400">
        <Loader2 size={24} className="animate-spin text-violet-500 mr-2" />
        <span className="text-sm font-medium">Loading workspace...</span>
      </div>
    );

  if (!problem)
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-neutral-950 text-neutral-500 dark:text-neutral-400">
        <span className="text-sm">Problem not found.</span>
      </div>
    );

  const visibleTestCases = problem.testCases?.filter((tc) => !tc.isHidden) ?? [];
  const passedCount = results ? results.filter((r) => r.passed).length : 0;
  const allPassed = results && passedCount === results.length;

  const tabs = [
    { id: 'problem', label: 'Problem', icon: BookOpen },
    { id: 'testcases', label: `Test Cases (${visibleTestCases.length})`, icon: Code2 },
    {
      id: 'results',
      label: results ? `Results (${passedCount}/${results.length})` : 'Results',
      icon: Terminal,
    },
    { id: 'ai', label: 'AI Solutions', icon: Bot },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] w-full dark:bg-[#0a0a0a] bg-neutral-50 p-2 font-sans overflow-hidden">
      <Allotment>
        <Allotment.Pane minSize={350} preferredSize="40%">
          {/* ── LEFT PANEL ─── */}
          <div className="flex flex-col h-full rounded-xl border border-neutral-200 dark:border-white/10 dark:bg-[#0f0f11] bg-white overflow-hidden mr-1 shadow-2xl relative">
            {/* Tabs Header */}
            <div className="flex border-b border-neutral-100 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] p-2 gap-1 overflow-x-auto no-scrollbar shrink-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'relative px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap',
                      isActive
                        ? 'text-neutral-900 dark:text-white'
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-200 hover:bg-neutral-100 dark:bg-white/5',
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-tab"
                        className="absolute inset-0 bg-neutral-200 dark:bg-white/10 rounded-lg"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <Icon
                      size={14}
                      className={cn('relative z-10', isActive ? 'text-violet-400' : '')}
                    />
                    <span className="relative z-10">{tab.label}</span>
                    {tab.id === 'results' && results && (
                      <span
                        className={cn(
                          'relative z-10 ml-1 rounded-full px-1.5 py-0.5 text-[10px]',
                          allPassed
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400',
                        )}
                      >
                        {allPassed ? 'Passed' : 'Failed'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar">
              {/* ── PROBLEM TAB ── */}
              {activeTab === 'problem' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Header */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                        {problem.title}
                      </h1>
                      {isSolved && (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                          <CheckCircle size={14} /> Solved
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-medium text-neutral-500 dark:text-neutral-400 flex-wrap">
                      <Badge label={problem.difficulty} variant={problem.difficulty} />
                      <span className="bg-neutral-100 dark:bg-white/5 px-2 py-1 rounded-md">
                        Acceptance:{' '}
                        {problem.totalSubmissions > 0
                          ? Math.round(
                              (problem.acceptedSubmissions / problem.totalSubmissions) * 100,
                            )
                          : 0}
                        %
                      </span>
                      <span className="bg-neutral-100 dark:bg-white/5 px-2 py-1 rounded-md">
                        Time Limit: {problem.timeLimit || 2000}ms
                      </span>
                    </div>
                    {problem.tags?.length > 0 && (
                      <div className="flex gap-2 flex-wrap pt-2">
                        {problem.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* AI Quick Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => triggerAi('Can you explain this problem to me simply?')}
                      className="flex-1 group flex items-center justify-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 py-2.5 rounded-xl text-xs font-semibold transition-all"
                    >
                      <BookOpen size={14} className="group-hover:scale-110 transition-transform" />{' '}
                      Explain Problem
                    </button>
                    <button
                      onClick={() =>
                        triggerAi(
                          'Can you give me a small hint for this problem without giving away the solution?',
                        )
                      }
                      className="flex-1 group flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 py-2.5 rounded-xl text-xs font-semibold transition-all"
                    >
                      <Lightbulb size={14} className="group-hover:scale-110 transition-transform" />{' '}
                      Get a Hint
                    </button>
                    <button
                      onClick={handleGenerateSolution}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-all group"
                    >
                      <Bot size={14} className="group-hover:scale-110 transition-transform" />{' '}
                      Solution
                    </button>
                  </div>

                  {/* Description */}
                  <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-neutral-100 dark:bg-white/5 prose-pre:border-neutral-200 dark:border-white/10 prose-pre:border text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    <ReactMarkdown>{problem.description}</ReactMarkdown>
                  </div>

                  {/* Technical Details Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Parameters */}
                    {problem.parameters?.length > 0 && (
                      <div className="bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3 text-neutral-200 font-semibold text-sm">
                          <Code2 size={16} className="text-violet-400" /> Parameters
                        </div>
                        <ul className="space-y-3">
                          {problem.parameters.map((p, i) => (
                            <li key={i} className="text-xs">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded border border-violet-500/20">
                                  {p.name}
                                </span>
                                <span className="text-neutral-500 italic">{p.type}</span>
                              </div>
                              <span className="text-neutral-500 dark:text-neutral-400 ml-1">
                                {p.description}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Return Value */}
                    {problem.returnValue && (
                      <div className="bg-neutral-50 dark:bg-white/[0.02] border border-neutral-200 dark:border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3 text-neutral-200 font-semibold text-sm">
                          <CheckCircle size={16} className="text-emerald-400" /> Returns
                        </div>
                        <div className="text-xs">
                          <span className="font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/20 block w-max mb-1.5">
                            {problem.returnValue.type}
                          </span>
                          <span className="text-neutral-500 dark:text-neutral-400 ml-1">
                            {problem.returnValue.description}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Constraints */}
                  {problem.constraints && (
                    <div className="bg-[#1a1525] border border-violet-500/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2 text-violet-300 font-semibold text-sm">
                        <Info size={16} /> Constraints
                      </div>
                      <div className="prose prose-invert prose-sm max-w-none text-[13px] text-violet-200/70 font-mono">
                        <ReactMarkdown>{problem.constraints}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── TEST CASES TAB ── */}
              {activeTab === 'testcases' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col h-full"
                >
                  {visibleTestCases.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-neutral-500 text-sm">
                      All test cases are hidden. Run code to evaluate.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Sub Tabs */}
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {visibleTestCases.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedTestCase(i)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                              selectedTestCase === i
                                ? 'bg-neutral-200 dark:bg-white/10 text-neutral-900 dark:text-white shadow-sm'
                                : 'bg-transparent text-neutral-500 hover:bg-neutral-100 dark:bg-white/5 hover:text-neutral-700 dark:text-neutral-300',
                            )}
                          >
                            Case {i + 1}
                          </button>
                        ))}
                      </div>

                      {/* Selected Case View */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={selectedTestCase}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.15 }}
                          className="space-y-4"
                        >
                          <div>
                            <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 pl-1">
                              Input
                            </div>
                            <pre className="p-4 rounded-xl bg-white/[0.03] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-mono text-xs overflow-x-auto shadow-inner whitespace-pre-wrap">
                              {visibleTestCases[selectedTestCase].input}
                            </pre>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 pl-1">
                              Expected Output
                            </div>
                            <pre className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs overflow-x-auto shadow-inner whitespace-pre-wrap">
                              {visibleTestCases[selectedTestCase].expectedOutput}
                            </pre>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── RESULTS TAB ── */}
              {activeTab === 'results' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col h-full"
                >
                  {(running || submitting) && (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-neutral-500 dark:text-neutral-400">
                      <div className="relative flex items-center justify-center w-16 h-16 bg-violet-500/10 rounded-2xl border border-violet-500/20">
                        <Loader2 size={28} className="animate-spin text-violet-500" />
                      </div>
                      <span className="text-sm font-semibold tracking-wide animate-pulse">
                        {running ? 'Evaluating Code...' : 'Judging Submission...'}
                      </span>
                    </div>
                  )}

                  {!running && !submitting && !results && (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                      <Terminal size={48} className="text-neutral-700" />
                      <div>
                        <p className="text-neutral-700 dark:text-neutral-300 font-medium">
                          No Results Yet
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Run your code to compile and evaluate test cases.
                        </p>
                      </div>
                    </div>
                  )}

                  {!running && !submitting && results && (
                    <div className="space-y-6">
                      {/* Result Header */}
                      <div
                        className={cn(
                          'flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-md',
                          allPassed
                            ? 'bg-emerald-500/10 border-emerald-500/20'
                            : 'bg-rose-500/10 border-rose-500/20',
                        )}
                      >
                        <div
                          className={cn(
                            'p-2 rounded-full',
                            allPassed
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400',
                          )}
                        >
                          {allPassed ? <CheckCircle size={24} /> : <XCircle size={24} />}
                        </div>
                        <div>
                          <h2
                            className={cn(
                              'text-lg font-bold',
                              allPassed ? 'text-emerald-400' : 'text-rose-400',
                            )}
                          >
                            {allPassed ? 'Accepted!' : 'Wrong Answer'}
                          </h2>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                            {passedCount} / {results.length} testcases passed
                          </p>
                        </div>
                      </div>

                      {/* Sub Tabs for Results */}
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {results.map((r, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedResultCase(i)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border',
                              selectedResultCase === i
                                ? r.passed
                                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                                  : 'bg-rose-500/20 border-rose-500/30 text-rose-300'
                                : 'bg-neutral-100 dark:bg-white/5 border-transparent text-neutral-500 hover:bg-neutral-200 dark:bg-white/10',
                            )}
                          >
                            <div
                              className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                r.passed ? 'bg-emerald-500' : 'bg-rose-500',
                              )}
                            />
                            Case {i + 1}
                          </button>
                        ))}
                      </div>

                      {/* Selected Result View */}
                      {results[selectedResultCase] && (
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={selectedResultCase}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-4"
                          >
                            {results[selectedResultCase].error ? (
                              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
                                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-2">
                                  <AlertTriangle size={16} /> Compilation / Runtime Error
                                </div>
                                <pre className="text-rose-300/80 font-mono text-xs whitespace-pre-wrap">
                                  {results[selectedResultCase].error}
                                </pre>
                              </div>
                            ) : (
                              <>
                                {results[selectedResultCase].input !== '(hidden)' && (
                                  <div>
                                    <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 pl-1">
                                      Input
                                    </div>
                                    <pre className="p-3 rounded-xl bg-white/[0.03] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-mono text-xs overflow-x-auto shadow-inner whitespace-pre-wrap">
                                      {results[selectedResultCase].input}
                                    </pre>
                                  </div>
                                )}
                                <div className="grid grid-cols-1 gap-4">
                                  <div>
                                    <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 pl-1">
                                      Expected Output
                                    </div>
                                    <pre className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs overflow-x-auto shadow-inner whitespace-pre-wrap">
                                      {results[selectedResultCase].expected}
                                    </pre>
                                  </div>
                                  {!results[selectedResultCase].passed && (
                                    <div>
                                      <div className="text-xs font-semibold text-rose-400 mb-2 pl-1">
                                        Actual Output
                                      </div>
                                      <pre className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-xs overflow-x-auto shadow-inner whitespace-pre-wrap">
                                        {results[selectedResultCase].actual || '(no output)'}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── AI SOLUTIONS TAB ── */}
              {activeTab === 'ai' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6 pb-8"
                >
                  <div className="flex items-center gap-3 p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                    <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center">
                      <Bot className="text-violet-400" size={20} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-violet-300">AI Verified Solutions</h2>
                      <p className="text-xs text-violet-300/70">
                        Review these standard approaches or generate a direct solution.
                      </p>
                    </div>
                  </div>

                  {generatingSolution ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-4 text-neutral-500 dark:text-neutral-400">
                      <div className="relative flex items-center justify-center w-12 h-12 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                        <Loader2 size={24} className="animate-spin text-emerald-500" />
                      </div>
                      <span className="text-sm font-semibold tracking-wide animate-pulse">
                        Generating optimal solution in {LANG_LABELS[language]}...
                      </span>
                    </div>
                  ) : generatedSolution ? (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                        <Bot size={16} /> Direct Solution ({LANG_LABELS[language]})
                      </h3>
                      <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-neutral-100 dark:bg-white/5 prose-pre:border-neutral-200 dark:border-white/10 prose-pre:border text-neutral-700 dark:text-neutral-300">
                        <ReactMarkdown>{generatedSolution}</ReactMarkdown>
                      </div>
                    </div>
                  ) : !problem.aiSolutions || Object.keys(problem.aiSolutions).length === 0 ? (
                    <div className="text-center py-10 flex flex-col items-center gap-4">
                      <p className="text-neutral-500 text-sm">
                        No solutions generated for this problem yet.
                      </p>
                      <button
                        onClick={handleGenerateSolution}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
                      >
                        Generate Solution
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {problem.aiSolutions?.bruteForce && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-bold text-orange-400 flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-orange-500/20 flex items-center justify-center text-[10px]">
                              1
                            </span>{' '}
                            Brute Force
                          </h3>
                          <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-neutral-100 dark:bg-white/5 prose-pre:border-neutral-200 dark:border-white/10 prose-pre:border text-neutral-700 dark:text-neutral-300">
                            <ReactMarkdown>{problem.aiSolutions.bruteForce}</ReactMarkdown>
                          </div>
                        </div>
                      )}

                      {problem.aiSolutions?.better && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center text-[10px]">
                              2
                            </span>{' '}
                            Better Approach
                          </h3>
                          <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-neutral-100 dark:bg-white/5 prose-pre:border-neutral-200 dark:border-white/10 prose-pre:border text-neutral-700 dark:text-neutral-300">
                            <ReactMarkdown>{problem.aiSolutions.better}</ReactMarkdown>
                          </div>
                        </div>
                      )}

                      {problem.aiSolutions?.optimal && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-emerald-500/20 flex items-center justify-center text-[10px]">
                              3
                            </span>{' '}
                            Optimal Approach
                          </h3>
                          <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-neutral-100 dark:bg-white/5 prose-pre:border-neutral-200 dark:border-white/10 prose-pre:border text-neutral-700 dark:text-neutral-300">
                            <ReactMarkdown>{problem.aiSolutions.optimal}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </Allotment.Pane>

        <Allotment.Pane minSize={400}>
          {/* ── RIGHT PANEL: Editor ── */}
          <div className="flex flex-col h-full rounded-xl border border-neutral-200 dark:border-white/10 dark:bg-[#0f0f11] bg-white overflow-hidden ml-1 shadow-2xl relative group">
            {/* Toolbar */}
            <div className="absolute top-4 right-6 left-6 z-10 flex items-center justify-between px-3 py-2 bg-neutral-900/60 backdrop-blur-xl border border-neutral-200 dark:border-white/10 rounded-2xl shadow-xl opacity-20 hover:opacity-100 transition-opacity duration-300">
              <div className="flex bg-black/50 p-1 rounded-xl">
                {Object.keys(DEFAULT_CODE).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => switchLanguage(lang)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative',
                      language === lang
                        ? 'text-neutral-900 dark:text-white'
                        : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-300',
                    )}
                  >
                    {language === lang && (
                      <motion.div
                        layoutId="active-lang"
                        className="absolute inset-0 bg-neutral-200 dark:bg-white/10 rounded-lg shadow-sm"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{LANG_LABELS[lang]}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleResetCode}
                  disabled={running || submitting}
                  className="p-2 rounded-xl bg-neutral-100 dark:bg-white/5 hover:bg-neutral-200 dark:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:text-white transition-all disabled:opacity-50"
                  title="Reset Code"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => triggerAi('')}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-300 font-bold text-xs transition-all"
                >
                  <Bot size={14} /> AI
                </button>
                <button
                  onClick={handleRun}
                  disabled={running || submitting}
                  className="flex items-center gap-2 px-5 py-1.5 rounded-xl bg-neutral-200 dark:bg-white/10 hover:bg-white/20 text-neutral-900 dark:text-white font-bold text-xs transition-all disabled:opacity-50"
                >
                  {running ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Play size={14} fill="currentColor" />
                  )}
                  Run
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={running || submitting}
                  className="flex items-center gap-2 px-5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-[0_0_15px_rgba(16,185,129,0.4)] font-bold text-xs transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Submit
                </button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 w-full h-full pt-16 pb-12 dark:bg-[#0f0f11] bg-white">
              <Editor
                height="100%"
                language={language === 'cpp' ? 'cpp' : language}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                value={code}
                onChange={(v) => setCode(v ?? '')}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                  bracketPairColorization: { enabled: true },
                  padding: { top: 20, bottom: 20 },
                  fontFamily: '"JetBrains Mono", "Fira Code", "Menlo", monospace',
                  fontLigatures: true,
                  cursorBlinking: 'smooth',
                  smoothScrolling: true,
                  scrollbar: {
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  },
                }}
              />
            </div>

            {/* Status bar */}
            <div className="absolute bottom-0 left-0 right-0 px-4 py-2 dark:bg-[#0f0f11] bg-white/90 backdrop-blur border-t border-neutral-200 dark:border-white/10 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5">
                  <Code2 size={12} /> {LANG_LABELS[language]}{' '}
                </span>
                <span>UTF-8</span>
              </div>

              {results && (
                <span className={cn('font-bold', allPassed ? 'text-emerald-500' : 'text-rose-400')}>
                  {passedCount}/{results.length} PASSED
                </span>
              )}
            </div>
          </div>
        </Allotment.Pane>
      </Allotment>

      <AiChat
        problemTitle={problem.title}
        userCode={code}
        language={language}
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
        initialMessage={initialAiMessage}
      />
    </div>
  );
};
