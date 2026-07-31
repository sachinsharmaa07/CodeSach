import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, Send, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { problemApi, submissionApi } from '@/services/problem.service';
import api from '@/lib/axios';

const DEFAULT_STARTERS: Record<string, string> = {
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}',
  python: 'def solve():\n    pass\n\nif __name__ == "__main__":\n    solve()',
  javascript: 'function solve() {\n  \n}\n',
  java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}',
};

export const ProblemDetail = () => {
  const { slug } = useParams();
  const [problem, setProblem] = useState<any>(null);
  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState(DEFAULT_STARTERS.cpp);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMsgs, setAiMsgs] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    problemApi.getBySlug(slug).then((res) => {
      const p = res.data.data.problem;
      setProblem(p);
      setCode(p.starterCode?.[language] || DEFAULT_STARTERS[language]);
    });
  }, [slug]);

  const handleRun = async () => {
    if (!problem) return;
    setRunning(true);
    setResults(null);
    try {
      const res = await submissionApi.run({ problemId: problem._id, code, language });
      setResults(res.data.data.results);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Run failed');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setSubmitting(true);
    try {
      const res = await submissionApi.submit({ problemId: problem._id, code, language });
      const { allPassed, marksAwarded, streak } = res.data.data;
      setResults(res.data.data.results);
      if (allPassed) {
        toast.success(marksAwarded > 0 ? `Accepted! +${marksAwarded} marks · Streak: ${streak.current}🔥` : 'Accepted! (already solved before)');
      } else {
        toast.error('Some test cases failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const askAi = async () => {
    if (!aiInput.trim()) return;
    const msg = aiInput;
    setAiMsgs((m) => [...m, { role: 'user', text: msg }]);
    setAiInput('');
    setAiLoading(true);
    try {
      const res = await api.post('/ai/hint', { problemTitle: problem?.title, userCode: code, message: msg, language });
      setAiMsgs((m) => [...m, { role: 'ai', text: res.data.data.reply }]);
    } catch {
      setAiMsgs((m) => [...m, { role: 'ai', text: 'Sorry, I could not get a hint right now.' }]);
    } finally {
      setAiLoading(false);
    }
  };

  if (!problem) return <div className="text-neutral-500 text-sm">Loading problem...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-8rem)]">
      <div className="overflow-y-auto rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-white">{problem.title}</h1>
          <Badge label={problem.difficulty} variant={problem.difficulty} />
          <Badge label={`${problem.marks} marks`} />
        </div>
        <p className="text-sm text-neutral-300 whitespace-pre-line">{problem.description}</p>

        {problem.examples?.map((ex: any, i: number) => (
          <div key={i} className="rounded-lg bg-black/30 p-3 text-xs font-mono space-y-1">
            <p><span className="text-neutral-500">Input:</span> {ex.input}</p>
            <p><span className="text-neutral-500">Output:</span> {ex.output}</p>
            {ex.explanation && <p className="text-neutral-500">{ex.explanation}</p>}
          </div>
        ))}

        {problem.constraints && (
          <div>
            <p className="text-sm font-medium text-neutral-300 mb-1">Constraints</p>
            <p className="text-xs text-neutral-500 whitespace-pre-line">{problem.constraints}</p>
          </div>
        )}

        <div className="border-t border-white/5 pt-4">
          <button onClick={() => setAiOpen((o) => !o)} className="flex items-center gap-2 text-sm text-violet-400">
            <Sparkles size={15} /> AI Assistant
          </button>
          {aiOpen && (
            <div className="mt-3 space-y-3">
              <div className="max-h-48 overflow-y-auto space-y-2">
                {aiMsgs.map((m, i) => (
                  <div key={i} className={`text-xs rounded-lg p-2 ${m.role === 'user' ? 'bg-violet-500/10 text-violet-200' : 'bg-white/5 text-neutral-300'}`}>
                    {m.text}
                  </div>
                ))}
                {aiLoading && <Loader2 size={14} className="animate-spin text-neutral-500" />}
              </div>
              <div className="flex gap-2">
                <input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && askAi()}
                  placeholder="Ask for a hint..."
                  className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500"
                />
                <Button size="sm" onClick={askAi} loading={aiLoading}>Ask</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col rounded-xl border border-white/5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-4 py-2">
          <select
            value={language}
            onChange={(e) => { setLanguage(e.target.value); setCode(problem.starterCode?.[e.target.value] || DEFAULT_STARTERS[e.target.value]); }}
            className="bg-transparent text-sm text-neutral-300 focus:outline-none"
          >
            {Object.keys(DEFAULT_STARTERS).map((l) => <option key={l} value={l} className="bg-[#1a1a1a]">{l}</option>)}
          </select>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleRun} loading={running}><Play size={13} /> Run</Button>
            <Button size="sm" onClick={handleSubmit} loading={submitting}><Send size={13} /> Submit</Button>
          </div>
        </div>

        <div className="flex-1 min-h-[300px]">
          <Editor
            height="100%"
            language={language === 'cpp' ? 'cpp' : language}
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v ?? '')}
            options={{ fontSize: 13, minimap: { enabled: false }, automaticLayout: true }}
          />
        </div>

        {results && (
          <div className="border-t border-white/5 max-h-48 overflow-y-auto p-3 space-y-2 bg-black/20">
            {results.map((r, i) => (
              <div key={i} className={`rounded-lg p-2 text-xs font-mono ${r.passed ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
                Test {i + 1}: {r.passed ? 'Passed' : 'Failed'} {r.error ? `— ${r.error}` : ''}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
