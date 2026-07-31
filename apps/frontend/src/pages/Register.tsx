import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GoogleButton } from '@/components/ui/GoogleButton';

export const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white/5 p-8 rounded-2xl border border-white/10">
        <div>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-white">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-neutral-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-violet-400 hover:text-violet-300">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-4">
            <Input
              id="username"
              type="text"
              label="Username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
            />
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

          <Button type="submit" className="w-full">
            Sign up
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#161616] px-3 text-xs text-neutral-500">or</span>
          </div>
        </div>

        <GoogleButton label="Continue with Google" />
      </div>
    </div>
  );
};
