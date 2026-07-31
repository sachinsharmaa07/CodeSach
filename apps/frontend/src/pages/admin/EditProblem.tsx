import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/axios';

export const EditProblem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // fetch by id via admin-visible list, then find — simplest path without a dedicated by-id admin route
    api.get('/problems').then((res) => {
      const found = res.data.data.problems.find((p: any) => p._id === id);
      if (found) setForm(found);
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
      });
      toast.success('Problem updated');
      navigate('/admin/problems');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div className="text-neutral-500 text-sm">Loading...</div>;

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold text-white">Edit Problem</h1>
      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
        <Input label="Title" value={form.title} onChange={(e) => setForm((f: any) => ({ ...f, title: e.target.value }))} />
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-300">Description</label>
          <textarea rows={5} value={form.description} onChange={(e) => setForm((f: any) => ({ ...f, description: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-300">Difficulty</label>
            <select value={form.difficulty} onChange={(e) => setForm((f: any) => ({ ...f, difficulty: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none">
              <option value="easy" className="bg-[#1a1a1a]">Easy</option>
              <option value="medium" className="bg-[#1a1a1a]">Medium</option>
              <option value="hard" className="bg-[#1a1a1a]">Hard</option>
            </select>
          </div>
          <Input label="Category" value={form.category} onChange={(e) => setForm((f: any) => ({ ...f, category: e.target.value }))} />
          <Input label="Marks" type="number" value={form.marks} onChange={(e) => setForm((f: any) => ({ ...f, marks: e.target.value }))} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-300">Constraints</label>
          <textarea rows={2} value={form.constraints} onChange={(e) => setForm((f: any) => ({ ...f, constraints: e.target.value }))}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500" />
        </div>
      </div>
      <Button onClick={handleSave} loading={saving}>Save Changes</Button>
    </div>
  );
};
