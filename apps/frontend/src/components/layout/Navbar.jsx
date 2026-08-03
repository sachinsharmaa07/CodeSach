import { Link, useNavigate } from 'react-router-dom';
import { Code2, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        background: 'color-mix(in srgb, var(--color-surface) 85%, transparent)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-neutral-100"
        >
          <Code2 size={20} className="text-violet-500" />
          <span>
            Code<span className="text-violet-500">Sach</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link
            to="/problems"
            className="transition-colors text-neutral-600 hover:text-violet-500 dark:text-neutral-400 dark:hover:text-violet-400"
          >
            Problems
          </Link>
          <Link
            to="/sheet"
            className="transition-colors font-medium text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300"
          >
            DSA Sheet
          </Link>
          <Link
            to="/leaderboard"
            className="transition-colors text-neutral-600 hover:text-violet-500 dark:text-neutral-400 dark:hover:text-violet-400"
          >
            Leaderboard
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="transition-colors flex items-center gap-1 text-neutral-600 hover:text-violet-500 dark:text-neutral-400 dark:hover:text-violet-400"
            >
              <LayoutDashboard size={14} /> Admin
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors text-neutral-600 hover:text-violet-500 dark:text-neutral-400 dark:hover:text-violet-400"
              >
                <User size={15} />
                <span className="hidden sm:inline">{user?.username}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-900 dark:text-white"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
