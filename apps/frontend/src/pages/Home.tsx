import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Zap, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const features = [
  {
    icon: Code2,
    title: 'Rich Code Editor',
    desc: 'Monaco editor with syntax highlighting and IntelliSense',
  },
  {
    icon: Zap,
    title: 'Instant Execution',
    desc: 'Run your code against test cases in milliseconds via Judge0',
  },
  {
    icon: Trophy,
    title: 'Leaderboard',
    desc: 'Compete with developers globally and track your rank',
  },
];

export const Home = () => (
  <div className="flex flex-col items-center py-20 text-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <span className="inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-400 mb-6">
        Open source coding platform
      </span>
      <h1 className="text-5xl font-semibold tracking-tight text-white mb-4">
        Master algorithms.
        <br />
        <span className="text-violet-400">Ace interviews.</span>
      </h1>
      <p className="text-neutral-400 text-lg mb-8 max-w-xl mx-auto">
        Practice data structures and algorithms with a clean, fast editor and real test case
        feedback.
      </p>
      <div className="flex gap-3 justify-center">
        <Link to="/problems">
          <Button size="lg">
            Start Solving <ArrowRight size={16} />
          </Button>
        </Link>
        <Link to="/register">
          <Button variant="outline" size="lg">
            Create Account
          </Button>
        </Link>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl"
    >
      {features.map(({ icon: Icon, title, desc }) => (
        <div
          key={title}
          className="rounded-xl border border-white/5 bg-white/[0.02] p-6 text-left hover:border-violet-500/20 transition-colors"
        >
          <div className="mb-3 inline-flex rounded-lg bg-violet-500/10 p-2">
            <Icon size={18} className="text-violet-400" />
          </div>
          <h3 className="font-medium text-white mb-1">{title}</h3>
          <p className="text-sm text-neutral-500">{desc}</p>
        </div>
      ))}
    </motion.div>
  </div>
);
