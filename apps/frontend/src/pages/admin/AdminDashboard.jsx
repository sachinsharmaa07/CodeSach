import { Link } from 'react-router-dom';
import { FileCode, Activity } from 'lucide-react';

export const AdminDashboard = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
      <p className="text-neutral-400">
        Manage problems and monitor submissions across the platform.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/admin/problems"
          className="block rounded-xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.05] transition"
        >
          <div className="flex items-center gap-4">
            <div className="bg-violet-500/10 p-3 rounded-lg text-violet-400">
              <FileCode size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Manage Problems</h2>
              <p className="text-sm text-neutral-500 mt-1">
                Create, edit, or delete coding challenges and test cases.
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/submissions"
          className="block rounded-xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.05] transition"
        >
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-400">
              <Activity size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Recent Submissions</h2>
              <p className="text-sm text-neutral-500 mt-1">
                Monitor real-time user code submissions and execution statuses.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};
