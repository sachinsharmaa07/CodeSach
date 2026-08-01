import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout = () => (
  <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface)' }}>
    <Navbar />
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Outlet />
    </main>
  </div>
);