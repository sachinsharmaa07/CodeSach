import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Code2,
  Zap,
  Trophy,
  Bot,
  Send,
  Search,
  X,
  Loader2,
  CheckCircle2,
  Users,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/axios';

// Removed AI Chat Widget

// ─── Global Search Bar ────────────────────────────────────────────────────────
function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ problems: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const search = (q) => {
    setQuery(q);
    clearTimeout(timer.current);
    if (!q.trim()) {
      setResults({ problems: [], users: [] });
      setOpen(false);
      return;
    }
    setOpen(true);
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const [pRes, uRes] = await Promise.allSettled([
          api.get(`/problems?search=${encodeURIComponent(q)}&limit=4`),
          api
            .get(`/users/search?q=${encodeURIComponent(q)}&limit=3`)
            .catch(() => ({ data: { data: { users: [] } } })),
        ]);
        setResults({
          problems: pRes.status === 'fulfilled' ? (pRes.value.data?.data?.problems ?? []) : [],
          users: uRes.status === 'fulfilled' ? (uRes.value.data?.data?.users ?? []) : [],
        });
      } catch {
        setResults({ problems: [], users: [] });
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const diffColor = (d) => (d === 'easy' ? '#22c55e' : d === 'medium' ? '#f59e0b' : '#ef4444');

  return (
    <div ref={ref} className="relative w-full max-w-lg mx-auto">
      <div
        className="flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <Search size={18} style={{ color: 'var(--color-text-muted)' }} />
        <input
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: 'var(--color-text)' }}
          placeholder="Search problems, users..."
          value={query}
          onChange={(e) => search(e.target.value)}
          onFocus={() => query && setOpen(true)}
        />
        {loading && <Loader2 size={16} className="animate-spin text-violet-400" />}
        {query && !loading && (
          <button
            onClick={() => {
              setQuery('');
              setOpen(false);
            }}
          >
            <X size={16} style={{ color: 'var(--color-text-muted)' }} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (results.problems.length > 0 || results.users.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-full mt-2 w-full rounded-2xl border shadow-2xl z-50 overflow-hidden"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
          >
            {results.problems.length > 0 && (
              <div className="p-2">
                <p
                  className="px-3 py-1 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Problems
                </p>
                {results.problems.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => {
                      navigate(`/problems/${p.slug || p._id}`);
                      setOpen(false);
                      setQuery('');
                    }}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--color-text)' }}
                  >
                    <span className="flex items-center gap-2">
                      <Code2 size={14} className="text-violet-400" />
                      {p.title}
                    </span>
                    <span
                      className="text-xs font-medium capitalize"
                      style={{ color: diffColor(p.difficulty) }}
                    >
                      {p.difficulty}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {results.users.length > 0 && (
              <div className="p-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <p
                  className="px-3 py-1 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Users
                </p>
                {results.users.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => {
                      navigate(`/profile/${u._id}`);
                      setOpen(false);
                      setQuery('');
                    }}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--color-text)' }}
                  >
                    <div className="h-6 w-6 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-bold text-violet-400">
                      {u.username?.[0]?.toUpperCase()}
                    </div>
                    {u.username}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Features data ────────────────────────────────────────────────────────────
const features = [
  {
    icon: Code2,
    title: 'Multi-Language Editor',
    desc: 'Monaco editor with JS, Python, C++, Java — all with syntax highlighting',
    color: '#7c3aed',
  },
  {
    icon: Zap,
    title: 'Instant Execution',
    desc: 'Local execution engine runs your code with real test cases in milliseconds',
    color: '#0ea5e9',
  },
  {
    icon: Trophy,
    title: 'Leaderboard',
    desc: 'Compete globally and track your rank among thousands of developers',
    color: '#f59e0b',
  },
  {
    icon: Bot,
    title: 'AI Assistant',
    desc: 'Built-in AI chat to help you understand concepts and debug your code',
    color: '#22c55e',
  },
  {
    icon: BarChart3,
    title: '46+ Problems',
    desc: 'Easy, medium, hard — curated problems from top tech interviews',
    color: '#ec4899',
  },
  {
    icon: CheckCircle2,
    title: 'Instant Feedback',
    desc: 'Visible & hidden test cases with detailed pass/fail diff output',
    color: '#14b8a6',
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export const Home = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/problems', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full flex flex-col items-center py-24 px-4 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute left-1/2 top-0 -translate-x-1/2 h-72 w-72 rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl w-full"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-400 mb-6">
            <Sparkles size={12} /> Open source · 46 curated problems · AI-powered
          </span>

          <h1
            className="text-5xl md:text-6xl font-bold tracking-tight mb-5 leading-tight"
            style={{ color: 'var(--color-text)' }}
          >
            Master algorithms.{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #38bdf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Ace interviews.
            </span>
          </h1>

          <p
            className="text-lg mb-10 max-w-xl mx-auto"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Practice data structures &amp; algorithms with a fast multi-language editor, real test
            cases, and an AI assistant right inside the platform.
          </p>

          {/* Search */}
          <div className="mb-8">
            <GlobalSearch />
          </div>

          {/* CTAs */}
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/problems">
              <Button size="lg" id="home-start-solving">
                Start Solving <ArrowRight size={16} />
              </Button>
            </Link>
            {isAuthenticated ? (
              <Link to="/profile">
                <Button variant="outline" size="lg" id="home-profile">
                  <Users size={16} /> {user?.username}
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button variant="outline" size="lg" id="home-create-account">
                  Create Account
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      </section>

      {/* Stats strip */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-4xl px-4 mb-16"
      >
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: '46+', label: 'Problems' },
            { value: 'JS · Py · C++ · Java', label: 'Languages' },
            { value: '∞', label: 'Submissions' },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="rounded-2xl border p-6 text-center"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <p className="text-2xl font-bold text-violet-400">{value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Features grid */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-5xl px-4 pb-24"
      >
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: 'var(--color-text)' }}>
          Everything you need to succeed
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <motion.div
              key={title}
              whileHover={{ y: -4 }}
              className="rounded-2xl border p-6 text-left transition-all cursor-default"
              style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <div
                className="mb-4 inline-flex rounded-xl p-2.5"
                style={{ background: `${color}22` }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <h3 className="font-semibold mb-1.5" style={{ color: 'var(--color-text)' }}>
                {title}
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
};
