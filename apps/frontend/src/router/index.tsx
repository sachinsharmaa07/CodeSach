import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { Problems } from '@/pages/Problems';
import { NotFound } from '@/pages/NotFound';
import { AuthCallback } from '@/pages/AuthCallback';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'problems', element: <Problems /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'auth/callback', element: <AuthCallback /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

export const AppRouter = () => <RouterProvider router={router} />;
