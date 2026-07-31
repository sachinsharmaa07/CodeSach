import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Trophy, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';
import { useAuthStore } from '@/store/auth.store';

export const Profile = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    api.get('/auth/me').then((res) => setProfile(res.data.data.user));
  }, []);

  const chartData = (profile?.dailyActivity ?? [])
    .slice(-30)
    .map((d: any) => ({ date: d.date.slice(5), count: d.count }));

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
          <h1 className="text-xl font-semibold text-white">{user?.username}</h1>
          <p className="text-sm text-neutral-500">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 flex items-center gap-3">
          <Trophy size={20} className="text-amber-400" />
          <div>
            <p className="text-lg font-semibold text-white">{profile?.totalScore ?? 0}</p>
            <p className="text-xs text-neutral-500">Total Marks</p>
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 flex items-center gap-3">
          <Flame size={20} className="text-orange-400" />
          <div>
            <p className="text-lg font-semibold text-white">{profile?.streak?.current ?? 0} days</p>
            <p className="text-xs text-neutral-500">Current Streak (longest: {profile?.streak?.longest ?? 0})</p>
          </div>
        </div>
        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-400" />
          <div>
            <p className="text-lg font-semibold text-white">{profile?.solvedProblems?.length ?? 0}</p>
            <p className="text-xs text-neutral-500">Problems Solved</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
        <h2 className="text-sm font-medium text-white mb-4">Activity (last 30 days)</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#737373' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="count" stroke="#7c3aed" fill="url(#grad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
