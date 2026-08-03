import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GoogleButton } from '@/components/ui/GoogleButton';
import api from '@/lib/axios';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth, isAuthenticated } = useAuthStore();

  // Already logged in — redirect immediately
  if (isAuthenticated) return <Navigate to="/problems" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.status === 'success') {
        setAuth(data.data.user, data.data.accessToken);
        toast.success(`Welcome back, ${data.data.user.username}!`);
        navigate(data.data.user.role === 'admin' ? '/admin' : '/problems', { replace: true });
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div
        className="w-full max-w-md space-y-8 rounded-2xl p-8 border"
        style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div>
          <h1
            className="mt-2 text-center text-3xl font-bold tracking-tight"
            style={{ color: 'var(--color-text)' }}
          >
            Welcome back
          </h1>
          <p className="mt-2 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-violet-500 hover:text-violet-400 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              id="password"
              type="password"
              label="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" className="w-full" loading={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: 'var(--color-border)' }} />
          </div>
          <div className="relative flex justify-center">
            <span
              className="px-3 text-xs"
              style={{ background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
            >
              or
            </span>
          </div>
        </div>

        <GoogleButton label="Continue with Google" />
      </div>
    </div>
  );
};
