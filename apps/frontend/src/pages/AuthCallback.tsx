import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/auth.store';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    const error = params.get('error');

    if (error || !token || !userStr) {
      toast.error('Google sign-in failed. Please try again.');
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userStr));
      setAuth(user, token);
      toast.success(`Welcome, ${user.username}!`);
      navigate(user.role === 'admin' ? '/admin' : '/problems');
    } catch {
      toast.error('Something went wrong. Please try again.');
      navigate('/login');
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        <p className="text-neutral-400 text-sm">Signing you in...</p>
      </div>
    </div>
  );
};
