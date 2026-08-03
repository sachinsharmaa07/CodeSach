import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Play,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  Code2,
  AlertTriangle,
  Terminal,
  RotateCcw,
  Bot,
} from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AiChat } from '@/components/AiChat';
import { problemApi, submissionApi } from '@/services/problem.service';
import { useThemeStore } from '@/store/theme.store';
import api from '@/lib/axios';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';

const DEFAULT_CODE = {
  javascript: `function solve() {
  // Write your solution here
  
}`,
  python: `def solve():
    # Write your solution here
    pass`,
  cpp: `// Write your solution here
// Example: vector<int> twoSum(vector<int>& nums, int target) { ... }
`,
  java: `// Write your solution method here
// Example: public int[] twoSum(int[] nums, int target) { ... }
`,
};

const LANG_LABELS = { cpp: 'C++', python: 'Python 3', javascript: 'JavaScript', java: 'Java' };

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
  const [activeTab, setActiveTab] = useState('problem'); // 'problem' | 'testcases' | 'results'
  const [aiOpen, setAiOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    problemApi
      .getBySlug(slug)
      .then((res) => {
        const p = res.data.data.problem;
        setProblem(p);
        setIsSolved(res.data.data.isSolved || false);
        // Use saved starter code or default
        const starter = p.starterCode?.get
          ? p.starterCode.get(language) || p.starterCode[language]
          : p.starterCode?.[language];
        setCode(starter || DEFAULT_CODE[language]);
      })
      .catch(() => toast.error('Failed to load problem'))
      .finally(() => setLoading(false));
  }, [slug]);

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

  if (loading)
    return (
      <div
        className="flex items-center justify-center h-64 gap-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <Loader2 size={16} className="animate-spin text-violet-500" />
        <span className="text-sm">Loading problem…</span>
      </div>
    );

  if (!problem)
    return (
      <div
        className="flex items-center justify-center h-64"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <span className="text-sm">Problem not found.</span>
      </div>
    );

  const visibleTestCases = problem.testCases?.filter((tc) => !tc.isHidden) ?? [];
  const passedCount = results ? results.filter((r) => r.passed).length : 0;
  const allPassed = results && passedCount === results.length;

  return (
    <div style={{ height: 'calc(100vh - 4rem)', width: '100%' }}>
      <Allotment>
        <Allotment.Pane minSize={300}>
          {/* ── LEFT PANEL ─── */}
          <div
            className="flex flex-col rounded-xl border overflow-hidden"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
          >
            {/* Tabs */}
            <div className="flex border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
              {[
                { id: 'problem', label: 'Problem' },
                { id: 'testcases', label: `Test Cases (${visibleTestCases.length})` },
                {
                  id: 'results',
                  label: results ? `Results (${passedCount}/${results.length})` : 'Results',
                },
                { id: 'ai-explain', label: 'Explanation (AI)' },
                { id: 'ai-hint', label: 'Hints (AI)' },
                { id: 'ai-solution', label: 'Solution (AI)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-4 py-2.5 text-sm font-medium transition-colors border-b-2"
                  style={{
                    color:
                      activeTab === tab.id ? 'var(--color-brand-light)' : 'var(--color-text-muted)',
                    borderBottomColor: activeTab === tab.id ? 'var(--color-brand)' : 'transparent',
                    background: 'transparent',
                  }}
                >
                  {tab.label}
                  {tab.id === 'results' && results && (
                    <span
                      className={`ml-1.5 text-xs ${allPassed ? 'text-emerald-400' : 'text-red-400'}`}
                    >
                      {allPassed ? '✓' : '✗'}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* ── PROBLEM TAB ── */}
              {activeTab === 'problem' && (
                <div className="space-y-5">
                  {/* Header */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                        {problem.title}
                      </h1>
                      {isSolved && (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle size={12} /> Solved
                        </span>
                      )}
                    </div>

                    <div
                      className="flex items-center gap-3 text-xs flex-wrap"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <Badge label={problem.difficulty} variant={problem.difficulty} />
                      <span>
                        Acceptance:{' '}
                        {problem.totalSubmissions > 0
                          ? Math.round(
                              (problem.acceptedSubmissions / problem.totalSubmissions) * 100,
                            )
                          : 0}
                        %
                      </span>
                      <span>Solves: {problem.acceptedSubmissions}</span>
                      <span>Time Limit: {problem.timeLimit || 2000}ms</span>
                      <span>Memory Limit: {problem.memoryLimit || 256}MB</span>
                    </div>

                    <div className="flex gap-2 flex-wrap mt-1">
                      {problem.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] px-2 py-1 rounded-md bg-white/5 border border-white/10"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          {tag}
                        </span>
                      ))}
                      {problem.companies?.map((company) => (
                        <span
                          key={company}
                          className="text-[11px] px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400"
                        >
                          {company}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="prose prose-sm max-w-none" style={{ color: 'var(--color-text)' }}>
                    <ReactMarkdown>{problem.description}</ReactMarkdown>
                  </div>

                  {/* Function Signature */}
                  {problem.starterCode && problem.starterCode[language] && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                        Function Signature
                      </p>
                      <pre
                        className="text-xs p-3 rounded-lg border overflow-x-auto"
                        style={{
                          background: 'var(--color-surface-2)',
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-brand-light)',
                        }}
                      >
                        <code>{problem.starterCode[language]}</code>
                      </pre>
                    </div>
                  )}

                  {/* Parameters */}
                  {problem.parameters?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                        Parameters
                      </p>
                      <ul className="space-y-3">
                        {problem.parameters.map((p, i) => (
                          <li key={i} className="text-sm">
                            <code
                              className="px-1.5 py-0.5 rounded text-xs bg-white/5 border border-white/10"
                              style={{ color: 'var(--color-brand-light)' }}
                            >
                              {p.name}
                            </code>
                            <span
                              className="text-xs ml-2 italic"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              ({p.type})
                            </span>
                            <p className="mt-1 ml-1 text-sm" style={{ color: 'var(--color-text)' }}>
                              {p.description}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Return Value */}
                  {problem.returnValue && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                        Returns
                      </p>
                      <div className="text-sm">
                        <code
                          className="px-1.5 py-0.5 rounded text-xs bg-white/5 border border-white/10"
                          style={{ color: 'var(--color-brand-light)' }}
                        >
                          {problem.returnValue.type}
                        </code>
                        <p className="mt-1 ml-1 text-sm" style={{ color: 'var(--color-text)' }}>
                          {problem.returnValue.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Constraints */}
                  {problem.constraints && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                        Constraints
                      </p>
                      <div
                        className="prose prose-sm max-w-none text-[13px]"
                        style={{ color: 'var(--color-text)' }}
                      >
                        <ReactMarkdown>{problem.constraints}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* Examples */}
                  {problem.examples?.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                        Examples
                      </p>
                      {problem.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="rounded-lg p-3 border text-xs font-mono space-y-1.5"
                          style={{
                            background: 'var(--color-surface-2)',
                            borderColor: 'var(--color-border)',
                          }}
                        >
                          <div>
                            <span style={{ color: 'var(--color-text-muted)' }}>Input: </span>
                            <span
                              style={{ color: 'var(--color-text)' }}
                              className="whitespace-pre-wrap"
                            >
                              {ex.input}
                            </span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--color-text-muted)' }}>Output: </span>
                            <span className="text-emerald-500 font-medium">{ex.output}</span>
                          </div>
                          {ex.explanation && (
                            <div
                              style={{ color: 'var(--color-text-muted)' }}
                              className="text-[11px]"
                            >
                              💡 {ex.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Constraints */}
                  {problem.constraints && (
                    <div
                      className="rounded-lg p-3 border"
                      style={{
                        background: 'var(--color-surface-2)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      <p
                        className="text-xs font-semibold mb-1.5"
                        style={{ color: 'var(--color-text)' }}
                      >
                        Constraints
                      </p>
                      <p
                        className="text-xs whitespace-pre-line font-mono"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {problem.constraints}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {problem.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {problem.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-xs border"
                          style={{
                            color: '#a78bfa',
                            background: 'rgba(124,58,237,0.1)',
                            borderColor: 'rgba(124,58,237,0.25)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── TEST CASES TAB ── */}
              {activeTab === 'testcases' && (
                <div className="space-y-3">
                  {visibleTestCases.length === 0 ? (
                    <p
                      className="text-sm text-center py-8"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      All test cases are hidden. Run your code to see results.
                    </p>
                  ) : (
                    visibleTestCases.map((tc, i) => (
                      <div
                        key={i}
                        className="rounded-lg border overflow-hidden"
                        style={{ borderColor: 'var(--color-border)' }}
                      >
                        <div
                          className="px-3 py-1.5 text-xs font-medium border-b"
                          style={{
                            background: 'var(--color-surface-2)',
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          Test Case {i + 1}
                        </div>
                        <div
                          className="p-3 space-y-2 text-xs font-mono"
                          style={{ background: 'var(--color-surface)' }}
                        >
                          <div>
                            <span
                              className="text-xs font-sans mb-1 block"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              Input
                            </span>
                            <pre
                              className="whitespace-pre-wrap rounded p-2"
                              style={{
                                background: 'var(--color-surface-2)',
                                color: 'var(--color-text)',
                              }}
                            >
                              {tc.input}
                            </pre>
                          </div>
                          <div>
                            <span
                              className="text-xs font-sans mb-1 block"
                              style={{ color: 'var(--color-text-muted)' }}
                            >
                              Expected Output
                            </span>
                            <pre
                              className="whitespace-pre-wrap rounded p-2 text-emerald-500"
                              style={{ background: 'var(--color-surface-2)' }}
                            >
                              {tc.expectedOutput}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {problem.testCases?.some((tc) => tc.isHidden) && (
                    <p
                      className="text-xs text-center pt-2"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      + {problem.testCases.filter((tc) => tc.isHidden).length} hidden test cases
                    </p>
                  )}
                </div>
              )}

              {/* ── RESULTS TAB ── */}
              {activeTab === 'results' && (
                <div className="space-y-3">
                  {(running || submitting) && (
                    <div
                      className="flex items-center justify-center gap-2 py-10 text-sm"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <Loader2 size={18} className="animate-spin text-violet-500" />
                      {running ? 'Running test cases…' : 'Submitting solution…'}
                    </div>
                  )}
                  {!running && !submitting && !results && (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                      <Terminal
                        size={32}
                        style={{ color: 'var(--color-text-muted)', opacity: 0.4 }}
                      />
                      <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        Run your code to see test results here.
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}
                      >
                        JavaScript and Python work without Docker.
                      </p>
                    </div>
                  )}
                  {!running && !submitting && results && (
                    <>
                      {/* Summary */}
                      <div
                        className="flex items-center gap-3 rounded-lg p-3 border"
                        style={{
                          background: allPassed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                          borderColor: allPassed ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)',
                        }}
                      >
                        {allPassed ? (
                          <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle size={18} className="text-red-500 shrink-0" />
                        )}
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: allPassed ? '#34d399' : '#f87171' }}
                          >
                            {allPassed
                              ? 'All tests passed!'
                              : `${passedCount}/${results.length} tests passed`}
                          </p>
                        </div>
                      </div>

                      {/* Individual results */}
                      {results.map((r, i) => (
                        <div
                          key={i}
                          className="rounded-lg border overflow-hidden"
                          style={{
                            borderColor: r.passed
                              ? 'rgba(16,185,129,0.25)'
                              : 'rgba(239,68,68,0.25)',
                          }}
                        >
                          <div
                            className="flex items-center justify-between px-3 py-2"
                            style={{
                              background: r.passed
                                ? 'rgba(16,185,129,0.08)'
                                : 'rgba(239,68,68,0.08)',
                            }}
                          >
                            <div className="flex items-center gap-2 text-xs font-medium">
                              {r.passed ? (
                                <CheckCircle size={13} className="text-emerald-500" />
                              ) : (
                                <XCircle size={13} className="text-red-400" />
                              )}
                              <span style={{ color: r.passed ? '#34d399' : '#f87171' }}>
                                Test {i + 1}: {r.passed ? 'Passed' : 'Failed'}
                              </span>
                            </div>
                            {r.runtime > 0 && (
                              <span
                                className="text-xs"
                                style={{ color: 'var(--color-text-muted)' }}
                              >
                                {(r.runtime * 1000).toFixed(0)}ms
                              </span>
                            )}
                          </div>

                          {!r.passed && (
                            <div
                              className="p-3 text-xs font-mono space-y-2"
                              style={{
                                background: 'var(--color-surface)',
                                color: 'var(--color-text)',
                              }}
                            >
                              {r.error ? (
                                <div
                                  className="rounded p-2 border flex gap-2"
                                  style={{
                                    background: 'rgba(239,68,68,0.06)',
                                    borderColor: 'rgba(239,68,68,0.2)',
                                  }}
                                >
                                  <AlertTriangle
                                    size={12}
                                    className="text-red-400 shrink-0 mt-0.5"
                                  />
                                  <span className="text-red-400 whitespace-pre-wrap">
                                    {r.error}
                                  </span>
                                </div>
                              ) : (
                                <>
                                  {r.input !== '(hidden)' && (
                                    <div>
                                      <span style={{ color: 'var(--color-text-muted)' }}>
                                        Input:{' '}
                                      </span>
                                      <span className="whitespace-pre-wrap">{r.input}</span>
                                    </div>
                                  )}
                                  <div>
                                    <span style={{ color: 'var(--color-text-muted)' }}>
                                      Expected:{' '}
                                    </span>
                                    <span className="text-emerald-500">{r.expected}</span>
                                  </div>
                                  <div>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Got: </span>
                                    <span className="text-red-400">
                                      {r.actual || '(no output)'}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {/* ── AI EXPLANATION TAB ── */}
              {activeTab === 'ai-explain' && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    AI Explanation
                  </h2>
                  <div
                    className="prose prose-sm max-w-none text-[13px]"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <p>
                      Coming soon: The AI will explain what this problem is asking, its real-world
                      analogy, and inputs/outputs.
                    </p>
                  </div>
                </div>
              )}

              {/* ── AI HINTS TAB ── */}
              {activeTab === 'ai-hint' && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    Progressive Hints
                  </h2>
                  <div
                    className="prose prose-sm max-w-none text-[13px]"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <p>Coming soon: Request progressive hints without revealing the solution.</p>
                  </div>
                </div>
              )}

              {/* ── AI SOLUTION TAB ── */}
              {activeTab === 'ai-solution' && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    AI Solutions
                  </h2>
                  <div
                    className="prose prose-sm max-w-none text-[13px]"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    <p>
                      Coming soon: Brute Force, Better, and Optimal approaches will be explained
                      here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Allotment.Pane>
        <Allotment.Pane minSize={400}>
          {/* ── RIGHT PANEL: Editor ── */}
          <div
            className="flex flex-col rounded-xl border overflow-hidden"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
          >
            {/* Toolbar */}
            <div
              className="flex items-center justify-between px-4 py-2 border-b shrink-0"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}
            >
              <div className="flex gap-1">
                {Object.keys(DEFAULT_CODE).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => switchLanguage(lang)}
                    className="px-3 py-1 rounded text-xs font-medium transition-all"
                    style={{
                      background: language === lang ? 'rgba(124,58,237,0.2)' : 'transparent',
                      color: language === lang ? '#a78bfa' : 'var(--color-text-muted)',
                      border:
                        language === lang
                          ? '1px solid rgba(124,58,237,0.4)'
                          : '1px solid transparent',
                    }}
                  >
                    {LANG_LABELS[lang]}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleResetCode}
                  disabled={running || submitting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 hover:bg-white/5"
                  style={{ color: 'var(--color-text-muted)' }}
                  title="Reset Code"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  onClick={() => setAiOpen(!aiOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-white/5"
                  style={{ color: '#10b981' }}
                >
                  <Bot size={13} />
                  AI Helper
                </button>
                <button
                  onClick={handleRun}
                  disabled={running || submitting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                  style={{
                    background: 'var(--color-surface-3)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                >
                  {running ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                  Run
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={running || submitting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-50"
                  style={{ background: '#7c3aed' }}
                  onMouseEnter={(e) =>
                    !e.currentTarget.disabled && (e.currentTarget.style.background = '#6d28d9')
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#7c3aed')}
                >
                  {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  Submit
                </button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                language={language === 'cpp' ? 'cpp' : language}
                theme={theme === 'dark' ? 'vs-dark' : 'light'}
                value={code}
                onChange={(v) => setCode(v ?? '')}
                options={{
                  fontSize: 13,
                  minimap: { enabled: false },
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  renderLineHighlight: 'line',
                  bracketPairColorization: { enabled: true },
                  padding: { top: 10, bottom: 10 },
                  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                  fontLigatures: true,
                }}
              />
            </div>

            {/* Status bar */}
            <div
              className="px-4 py-1.5 border-t flex items-center gap-3 shrink-0"
              style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface-2)' }}
            >
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {LANG_LABELS[language]}
              </span>
              {(language === 'cpp' || language === 'java') && (
                <span className="text-xs flex items-center gap-1" style={{ color: '#f59e0b' }}>
                  <AlertTriangle size={10} />
                  Requires Docker for {language === 'cpp' ? 'C++' : 'Java'}. Use JS/Python for local
                  runs.
                </span>
              )}
              {results && (
                <span
                  className={`ml-auto text-xs font-medium ${allPassed ? 'text-emerald-500' : 'text-red-400'}`}
                >
                  {passedCount}/{results.length} passed
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
      />
    </div>
  );
};
