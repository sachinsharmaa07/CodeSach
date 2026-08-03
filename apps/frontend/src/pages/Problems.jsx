import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { problemApi } from '@/services/problem.service';

export const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    problemApi
      .list()
      .then((res) => setProblems(res.data.data.problems))
      .finally(() => setLoading(false));
  }, []);

  const filtered = problems.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.difficulty === filter;
    return matchSearch && matchFilter;
  });

  const acceptance = (p) => {
    if (!p.totalSubmissions) return '—';
    return Math.round((p.acceptedSubmissions / p.totalSubmissions) * 100) + '%';
  };

  if (loading)
    return (
      <div className="text-neutral-700 dark:text-neutral-500 text-sm p-8">Loading problems...</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-700 dark:text-neutral-500"
          />
          <input
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-100 dark:bg-white/5 py-2 pl-9 pr-3 text-sm text-neutral-900 dark:text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'easy', 'medium', 'hard'].map((d) => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`px-3 py-2 rounded-lg text-sm capitalize transition-colors ${filter === d ? 'bg-violet-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] text-neutral-700 dark:text-neutral-500">
              <th className="text-left px-4 py-3 font-medium w-12">Status</th>
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 font-medium">Difficulty</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Acceptance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-neutral-700 dark:text-neutral-500"
                >
                  No problems found
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr
                  key={p._id}
                  className="border-b border-neutral-200 dark:border-white/5 hover:bg-neutral-50 dark:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-3">
                    <CheckCircle2 size={14} className="text-neutral-600" />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/problems/${p.slug}`}
                      className="text-neutral-900 dark:text-white hover:text-violet-400 transition-colors font-medium"
                    >
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-neutral-700 dark:text-neutral-500">
                    {p.category}
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={p.difficulty} variant={p.difficulty} />
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-neutral-700 dark:text-neutral-500">
                    {acceptance(p)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
