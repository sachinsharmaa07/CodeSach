import { useEffect, useState } from 'react';
import { Trophy, Flame } from 'lucide-react';
import { leaderboardApi } from '@/services/leaderboard.service';
import { useAuthStore } from '@/store/auth.store';

const RANK_COLORS = {
  1: 'text-amber-400',
  2: 'text-neutral-300',
  3: 'text-orange-400'
};

export const Leaderboard = () => {
  const { user } = useAuthStore();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leaderboardApi.top(50).
    then((res) => setRows(res.data.data.leaderboard)).
    finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-neutral-500 text-sm">Loading leaderboard...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white flex items-center gap-2">
          <Trophy size={22} className="text-amber-400" /> Leaderboard
        </h1>
        <p className="text-neutral-500 text-sm mt-1">Top solvers ranked by total marks</p>
      </div>

      <div className="rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02] text-neutral-500">
              <th className="text-left px-4 py-3 font-medium w-16">Rank</th>
              <th className="text-left px-4 py-3 font-medium">User</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Solved</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Streak</th>
              <th className="text-right px-4 py-3 font-medium">Marks</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) =>
            <tr key={r.id} className={`border-b border-white/5 ${r.username === user?.username ? 'bg-violet-500/5' : 'hover:bg-white/[0.02]'} transition-colors`}>
                <td className={`px-4 py-3 font-semibold ${RANK_COLORS[r.rank] ?? 'text-neutral-500'}`}>#{r.rank}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {r.avatar ?
                  <img src={r.avatar} className="h-6 w-6 rounded-full" /> :

                  <div className="h-6 w-6 rounded-full bg-violet-500/20 flex items-center justify-center text-[10px] text-violet-300">
                        {r.username[0]?.toUpperCase()}
                      </div>
                  }
                    <span className="text-white font-medium">{r.username}</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-neutral-400">{r.problemsSolved}</td>
                <td className="px-4 py-3 hidden sm:table-cell text-neutral-400">
                  <span className="inline-flex items-center gap-1">
                    <Flame size={13} className="text-orange-400" /> {r.currentStreak}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-white">{r.totalScore}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

};