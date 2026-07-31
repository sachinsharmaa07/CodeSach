import { Link, useNavigate } from 'react-router-dom';
import { Code2, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0f0f0f]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold text-white">
          <Code2 size={20} className="text-violet-400" />
          <span>
            Code<span className="text-violet-400">Sach</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/problems" className="text-neutral-400 hover:text-white transition-colors">
            Problems
          </Link>
          <Link to="/leaderboard" className="text-neutral-400 hover:text-white transition-colors">
            Leaderboard
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                <User size={16} />
                {user?.username}
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut size={15} />
              </Button>
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
