import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export const NotFound = () => (
  <div className="flex flex-col items-center justify-center py-32 text-center">
    <p className="text-7xl font-bold text-violet-500/20 mb-4">404</p>
    <h1 className="text-xl font-semibold text-white mb-2">Page not found</h1>
    <p className="text-neutral-500 mb-6">This page doesn't exist or was moved.</p>
    <Link to="/">
      <Button variant="outline">Go home</Button>
    </Link>
  </div>
);
