import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout = () => (
  <div className="min-h-screen bg-[#0f0f0f]">
    <Navbar />
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Outlet />
    </main>
  </div>
);
