import { useEffect, useState } from 'react';
import { Flame, Trophy, CheckCircle2 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
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

      <div className="rounded-xl border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-white/[0.02] p-5">
        <h2 className="text-sm font-medium text-neutral-900 dark:text-white mb-4">
          Activity (Last 30 Days)
        </h2>
        <div className="h-[250px] w-full">
          {(() => {
            const chartData = [];
            const today = new Date();
            for (let i = 29; i >= 0; i--) {
              const d = new Date(today);
              d.setDate(today.getDate() - i);
              const dateStr = d.toISOString().slice(0, 10);
              const count =
                (profile?.dailyActivity || []).find((a) => a.date === dateStr)?.count || 0;
              chartData.push({
                date: d.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
                submissions: count,
              });
            }
            return (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(255,255,255,0.05)"
                    className="dark:stroke-white/5 stroke-black/5"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    className="dark:fill-neutral-500 fill-neutral-400"
                    minTickGap={20}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    allowDecimals={false}
                    className="dark:fill-neutral-500 fill-neutral-400"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(23,23,23,0.9)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#a3a3a3', marginBottom: '4px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="submissions"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSubmissions)"
                    activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
