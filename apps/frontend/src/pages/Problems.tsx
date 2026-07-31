import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const MOCK_PROBLEMS = [
  {
    id: '1',
    title: 'Two Sum',
    difficulty: 'easy',
    category: 'Array',
    acceptance: '49.1%',
    solved: true,
  },
  {
    id: '2',
    title: 'Add Two Numbers',
    difficulty: 'medium',
    category: 'Linked List',
    acceptance: '40.3%',
    solved: false,
  },
  {
    id: '3',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'hard',
    category: 'Binary Search',
    acceptance: '38.5%',
    solved: false,
  },
  {
    id: '4',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'medium',
    category: 'Sliding Window',
    acceptance: '33.8%',
    solved: true,
  },
  {
    id: '5',
    title: 'Valid Parentheses',
    difficulty: 'easy',
    category: 'Stack',
    acceptance: '40.7%',
    solved: false,
  },
];

export const Problems = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const filtered = MOCK_PROBLEMS.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || p.difficulty === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'easy', 'medium', 'hard'] as const).map((d) => (
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

      <div className="rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02] text-neutral-500">
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Title</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 font-medium">Difficulty</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Acceptance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-3">
                  {p.solved ? (
                    <span className="text-emerald-400">✓</span>
                  ) : (
                    <Lock size={13} className="text-neutral-600" />
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/problems/${p.id}`}
                    className="text-white hover:text-violet-400 transition-colors font-medium"
                  >
                    {p.id}. {p.title}
                  </Link>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-neutral-500">{p.category}</td>
                <td className="px-4 py-3">
                  <Badge
                    label={p.difficulty}
                    variant={p.difficulty as 'easy' | 'medium' | 'hard'}
                  />
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-neutral-500">{p.acceptance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
