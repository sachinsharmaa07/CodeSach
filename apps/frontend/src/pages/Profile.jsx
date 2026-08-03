import { useEffect, useState } from 'react';
import { Flame, Trophy, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

export const Profile = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/auth/me').then((res) => setProfile(res.data.data.user));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {user?.avatar ? (
          <img src={user.avatar} className="h-14 w-14 rounded-full" />
        ) : (
          <div className="h-14 w-14 rounded-full bg-violet-500/20 flex items-center justify-center text-xl text-violet-300">
            {user?.username?.[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
            {user?.username}
          </h1>
          <p className="text-sm text-neutral-700 dark:text-neutral-500">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] p-5 flex items-center gap-3">
          <Trophy size={20} className="text-amber-400" />
          <div>
            <p className="text-lg font-semibold text-neutral-900 dark:text-white">
              {profile?.totalScore ?? 0}
            </p>
            <p className="text-xs text-neutral-700 dark:text-neutral-500">Total Marks</p>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] p-5 flex items-center gap-3">
          <Flame size={20} className="text-orange-400" />
          <div>
            <p className="text-lg font-semibold text-neutral-900 dark:text-white">
              {profile?.streak?.current ?? 0} days
            </p>
            <p className="text-xs text-neutral-700 dark:text-neutral-500">
              Current Streak (longest: {profile?.streak?.longest ?? 0})
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] p-5 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-400" />
          <div>
            <p className="text-lg font-semibold text-neutral-900 dark:text-white">
              {profile?.solvedProblems?.length ?? 0}
            </p>
            <p className="text-xs text-neutral-700 dark:text-neutral-500">Problems Solved</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] p-5 overflow-hidden">
        <h2 className="text-sm font-medium text-neutral-900 dark:text-white mb-4">
          Activity (Last Year)
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex flex-col gap-2 pt-6 shrink-0 text-xs text-neutral-700 dark:text-neutral-500 font-medium">
            <span className="h-3 leading-3">Mon</span>
            <span className="h-3 leading-3 mt-3">Wed</span>
            <span className="h-3 leading-3 mt-3">Fri</span>
          </div>
          <div className="flex-1 min-w-max">
            {(() => {
              const today = new Date();
              const days = [];
              for (let i = 364; i >= 0; i--) {
                const d = new Date(today);
                d.setDate(today.getDate() - i);
                days.push(d);
              }
              const firstDayOffset = days[0].getDay();
              const emptyStartDays = Array(firstDayOffset).fill(null);
              const allCells = [...emptyStartDays, ...days];

              // Generate month labels
              const months = [];
              let currentMonth = -1;
              allCells.forEach((d, i) => {
                if (i % 7 !== 0 || !d) return; // Only check the first day of each column
                if (d.getMonth() !== currentMonth) {
                  months.push({
                    name: d.toLocaleString('default', { month: 'short' }),
                    colIndex: i / 7,
                  });
                  currentMonth = d.getMonth();
                }
              });

              return (
                <div className="flex flex-col gap-2">
                  <div className="flex relative h-4 text-xs text-neutral-700 dark:text-neutral-500 font-medium">
                    {months.map((m, idx) => (
                      <span key={idx} className="absolute" style={{ left: `${m.colIndex * 16}px` }}>
                        {m.name}
                      </span>
                    ))}
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateRows: 'repeat(7, 1fr)',
                      gridAutoFlow: 'column',
                      gap: '4px',
                    }}
                  >
                    {allCells.map((d, i) => {
                      if (!d)
                        return (
                          <div key={`empty-${i}`} className="w-3 h-3 bg-transparent rounded-sm" />
                        );
                      const dateStr = d.toISOString().slice(0, 10);
                      const count =
                        (profile?.dailyActivity || []).find((a) => a.date === dateStr)?.count || 0;
                      let bg = 'bg-white/[0.04] border border-white/5';
                      if (count === 1) bg = 'bg-violet-900/60 border border-violet-800/50';
                      else if (count === 2) bg = 'bg-violet-700/80 border border-violet-600';
                      else if (count === 3) bg = 'bg-violet-500 border border-violet-400';
                      else if (count >= 4) bg = 'bg-violet-400 border border-violet-300';

                      return (
                        <div
                          key={dateStr}
                          className={`w-3 h-3 rounded-sm transition-colors hover:border-white ${bg}`}
                          title={`${dateStr}: ${count} submissions`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
