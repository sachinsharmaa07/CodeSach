import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/axios';

export const EditProblem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [parameters, setParameters] = useState([]);
  const [returnValue, setReturnValue] = useState({ type: 'integer array', description: '' });

  const addParameter = () =>
    setParameters((p) => [...p, { name: '', type: 'integer', description: '' }]);
  const removeParameter = (i) => setParameters((p) => p.filter((_, idx) => idx !== i));
  const updateParameter = (i, field, val) =>
    setParameters((p) => p.map((param, idx) => (idx === i ? { ...param, [field]: val } : param)));

  useEffect(() => {
    // fetch by id via admin-visible list, then find — simplest path without a dedicated by-id admin route
    api.get('/problems').then((res) => {
      const found = res.data.data.problems.find((p) => p._id === id);
      if (found) {
        setForm(found);
        if (found.parameters) setParameters(found.parameters);
        if (found.returnValue) setReturnValue(found.returnValue);
      }
    });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch(`/problems/${id}`, {
        title: form.title,
        description: form.description,
        difficulty: form.difficulty,
        category: form.category,
        marks: Number(form.marks),
        constraints: form.constraints,
        parameters,
        returnValue,
      });
      toast.success('Problem updated');
      navigate('/admin/problems');
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!form)
    return <div className="text-neutral-700 dark:text-neutral-500 text-sm">Loading...</div>;

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">Edit Problem</h1>
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
            onChange={(e) => setForm((f) => ({ ...f, marks: e.target.value }))}
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

      <Button onClick={handleSave} loading={saving}>
        Save Changes
      </Button>
    </div>
  );
};
