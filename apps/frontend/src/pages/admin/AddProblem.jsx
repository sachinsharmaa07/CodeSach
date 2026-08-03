import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { problemApi } from '@/services/problem.service';

export const AddProblem = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    category: '',
    marks: 10,
    constraints: '',
  });
  const [testCases, setTestCases] = useState([{ input: '', expectedOutput: '', isHidden: false }]);
  const [examples, setExamples] = useState([{ input: '', output: '', explanation: '' }]);
  const [parameters, setParameters] = useState([
    { name: 'nums', type: 'integer array', description: '' },
  ]);
  const [returnValue, setReturnValue] = useState({ type: 'integer array', description: '' });

  const addTestCase = () =>
    setTestCases((t) => [...t, { input: '', expectedOutput: '', isHidden: true }]);
  const removeTestCase = (i) => setTestCases((t) => t.filter((_, idx) => idx !== i));
  const updateTestCase = (i, field, val) =>
    setTestCases((t) => t.map((tc, idx) => (idx === i ? { ...tc, [field]: val } : tc)));

  const addExample = () => setExamples((e) => [...e, { input: '', output: '', explanation: '' }]);
  const updateExample = (i, field, val) =>
    setExamples((e) => e.map((ex, idx) => (idx === i ? { ...ex, [field]: val } : ex)));

  const addParameter = () =>
    setParameters((p) => [...p, { name: '', type: 'integer', description: '' }]);
  const removeParameter = (i) => setParameters((p) => p.filter((_, idx) => idx !== i));
  const updateParameter = (i, field, val) =>
    setParameters((p) => p.map((param, idx) => (idx === i ? { ...param, [field]: val } : param)));

  const handleSubmit = async () => {
    if (!form.title || !form.description || testCases.some((t) => !t.input || !t.expectedOutput)) {
      toast.error('Fill title, description, and all test case fields');
      return;
    }
    setSaving(true);
    try {
      await problemApi.create({
        ...form,
        marks: Number(form.marks),
        testCases,
        examples,
        parameters,
        returnValue,
      });
      toast.success('Problem created');
      navigate('/admin/problems');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Failed to create problem');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Add Problem</h1>

      <div className="rounded-xl border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] p-6 space-y-4">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-300">Description</label>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-violet-500"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-300">Difficulty</label>
            <select
              value={form.difficulty}
              onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
              className="w-full rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none"
            >
              <option value="easy" className="bg-[#1a1a1a]">
                Easy
              </option>
              <option value="medium" className="bg-[#1a1a1a]">
                Medium
              </option>
              <option value="hard" className="bg-[#1a1a1a]">
                Hard
              </option>
            </select>
          </div>
          <Input
            label="Category"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          />
          <Input
            label="Marks"
            type="number"
            value={form.marks}
            onChange={(e) => setForm((f) => ({ ...f, marks: Number(e.target.value) }))}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-300">Constraints</label>
          <textarea
            rows={2}
            value={form.constraints}
            onChange={(e) => setForm((f) => ({ ...f, constraints: e.target.value }))}
            className="w-full rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] p-6 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-medium text-neutral-900 dark:text-white">
            Function Parameters
          </h2>
          <Button size="sm" variant="ghost" onClick={addParameter}>
            <Plus size={14} />
          </Button>
        </div>
        {parameters.map((p, i) => (
          <div key={i} className="flex gap-2 items-start">
            <Input
              placeholder="Param Name (e.g. nums)"
              value={p.name}
              onChange={(e) => updateParameter(i, 'name', e.target.value)}
            />
            <select
              value={p.type}
              onChange={(e) => updateParameter(i, 'type', e.target.value)}
              className="rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none"
            >
              <option value="integer">Integer</option>
              <option value="string">String</option>
              <option value="boolean">Boolean</option>
              <option value="integer array">Integer Array</option>
              <option value="string array">String Array</option>
            </select>
            <Input
              placeholder="Description"
              value={p.description}
              onChange={(e) => updateParameter(i, 'description', e.target.value)}
            />
            <Button size="sm" variant="danger" onClick={() => removeParameter(i)}>
              <Trash2 size={13} />
            </Button>
          </div>
        ))}
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-white/10 space-y-2">
          <h2 className="text-sm font-medium text-neutral-900 dark:text-white">Return Value</h2>
          <div className="flex gap-2 items-start">
            <select
              value={returnValue.type}
              onChange={(e) => setReturnValue((prev) => ({ ...prev, type: e.target.value }))}
              className="rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 px-3 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none w-1/3"
            >
              <option value="integer">Integer</option>
              <option value="string">String</option>
              <option value="boolean">Boolean</option>
              <option value="integer array">Integer Array</option>
              <option value="string array">String Array</option>
            </select>
            <Input
              placeholder="Description"
              value={returnValue.description}
              onChange={(e) => setReturnValue((prev) => ({ ...prev, description: e.target.value }))}
              className="w-2/3"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] p-6 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-medium text-neutral-900 dark:text-white">Examples</h2>
          <Button size="sm" variant="ghost" onClick={addExample}>
            <Plus size={14} />
          </Button>
        </div>
        {examples.map((ex, i) => (
          <div key={i} className="grid grid-cols-3 gap-2">
            <Input
              placeholder="Input"
              value={ex.input}
              onChange={(e) => updateExample(i, 'input', e.target.value)}
            />
            <Input
              placeholder="Output"
              value={ex.output}
              onChange={(e) => updateExample(i, 'output', e.target.value)}
            />
            <Input
              placeholder="Explanation (optional)"
              value={ex.explanation}
              onChange={(e) => updateExample(i, 'explanation', e.target.value)}
            />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] p-6 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-medium text-neutral-900 dark:text-white">Test Cases</h2>
          <Button size="sm" variant="ghost" onClick={addTestCase}>
            <Plus size={14} />
          </Button>
        </div>
        {testCases.map((tc, i) => (
          <div key={i} className="flex gap-2 items-start">
            <Input
              placeholder="Input"
              value={tc.input}
              onChange={(e) => updateTestCase(i, 'input', e.target.value)}
            />
            <Input
              placeholder="Expected Output"
              value={tc.expectedOutput}
              onChange={(e) => updateTestCase(i, 'expectedOutput', e.target.value)}
            />
            <label className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 whitespace-nowrap pt-2">
              <input
                type="checkbox"
                checked={tc.isHidden}
                onChange={(e) => updateTestCase(i, 'isHidden', e.target.checked)}
              />
              Hidden
            </label>
            <Button size="sm" variant="danger" onClick={() => removeTestCase(i)}>
              <Trash2 size={13} />
            </Button>
          </div>
        ))}
      </div>

      <Button onClick={handleSubmit} loading={saving}>
        Create Problem
      </Button>
    </div>
  );
};
