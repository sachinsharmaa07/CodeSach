import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { problemApi } from '@/services/problem.service';
import api from '@/lib/axios';

export const AdminProblems = () => {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    problemApi.list().then((res) => setProblems(res.data.data.problems)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Deactivate "${title}"? It will be hidden from users but not permanently deleted.`)) return;
    try {
      await api.delete(`/problems/${id}`);
      toast.success('Problem deactivated');
      load();
    } catch {
      toast.error('Failed to deactivate problem');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Manage Problems</h1>
        <Link to="/admin/problems/new"><Button size="sm"><Plus size={14} /> Add Problem</Button></Link>
      </div>

      <div className="rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02] text-neutral-500">
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium">Difficulty</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Marks</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Submissions</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-neutral-500">Loading...</td></tr>
            ) : problems.map((p) => (
              <tr key={p._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-white font-medium">{p.title}</td>
                <td className="px-4 py-3"><Badge label={p.difficulty} variant={p.difficulty} /></td>
                <td className="px-4 py-3 hidden sm:table-cell text-neutral-400">{p.marks}</td>
                <td className="px-4 py-3 hidden sm:table-cell text-neutral-400">
                  {p.acceptedSubmissions}/{p.totalSubmissions}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link to={`/admin/problems/${p._id}/edit`}>
                      <Button size="sm" variant="ghost"><Pencil size={13} /></Button>
                    </Link>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(p._id, p.title)}>
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
