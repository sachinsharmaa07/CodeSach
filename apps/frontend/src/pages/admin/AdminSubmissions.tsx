import { useEffect, useState } from 'react';
import { adminApi } from '@/services/admin.service';
import { Badge } from '@/components/ui/Badge';

const STATUS_VARIANT: Record<string, 'easy' | 'hard' | 'default'> = {
  accepted: 'easy',
  wrong_answer: 'hard',
  compile_error: 'hard',
  runtime_error: 'hard',
};

export const AdminSubmissions = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi.submissions({ page, ...(statusFilter ? { status: statusFilter } : {}) })
      .then((res) => {
        setSubmissions(res.data.data.submissions);
        setTotalPages(res.data.data.pagination.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Submissions</h1>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-neutral-300 focus:outline-none"
        >
          <option value="" className="bg-[#1a1a1a]">All statuses</option>
          <option value="accepted" className="bg-[#1a1a1a]">Accepted</option>
          <option value="wrong_answer" className="bg-[#1a1a1a]">Wrong Answer</option>
          <option value="compile_error" className="bg-[#1a1a1a]">Compile Error</option>
          <option value="runtime_error" className="bg-[#1a1a1a]">Runtime Error</option>
        </select>
      </div>

      <div className="rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02] text-neutral-500">
              <th className="text-left px-4 py-3 font-medium">User</th>
              <th className="text-left px-4 py-3 font-medium">Problem</th>
              <th className="text-left px-4 py-3 font-medium">Language</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Marks</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-neutral-500">Loading...</td></tr>
            ) : submissions.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-neutral-500">No submissions found</td></tr>
            ) : submissions.map((s) => (
              <tr key={s._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-white">{s.user?.username ?? 'Unknown'}</td>
                <td className="px-4 py-3 text-neutral-300">{s.problem?.title ?? 'Deleted problem'}</td>
                <td className="px-4 py-3 text-neutral-500 uppercase text-xs">{s.language}</td>
                <td className="px-4 py-3">
                  <Badge label={s.status.replace('_', ' ')} variant={STATUS_VARIANT[s.status] ?? 'default'} />
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-neutral-400">{s.marksAwarded}</td>
                <td className="px-4 py-3 hidden md:table-cell text-neutral-500 text-xs">
                  {new Date(s.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-2">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1.5 rounded-lg text-sm text-neutral-400 border border-white/10 disabled:opacity-40 hover:bg-white/5">
          Previous
        </button>
        <span className="px-3 py-1.5 text-sm text-neutral-500">Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1.5 rounded-lg text-sm text-neutral-400 border border-white/10 disabled:opacity-40 hover:bg-white/5">
          Next
        </button>
      </div>
    </div>
  );
};
