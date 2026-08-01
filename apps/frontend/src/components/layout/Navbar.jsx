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
        <Link to="/" className="flex items-center gap-2 font-semibold" style={{ color: 'var(--color-text)' }}>
          <Code2 size={20} className="text-violet-500" />
          <span>Code<span className="text-violet-500">Sach</span></span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link
            to="/problems"
            className="transition-colors hover:text-violet-500"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Problems
          </Link>
          <Link
            to="/sheet"
            className="transition-colors hover:text-violet-500 font-medium"
            style={{ color: 'var(--color-brand)' }}
          >
            DSA Sheet
          </Link>
          <Link
            to="/leaderboard"
            className="transition-colors hover:text-violet-500"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Leaderboard
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="transition-colors hover:text-violet-500 flex items-center gap-1"
              style={{ color: 'var(--color-text-muted)' }}
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
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors hover:text-violet-500"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <User size={15} />
                <span className="hidden sm:inline">{user?.username}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
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