import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Home } from '@/pages/Home';
import { Problems } from '@/pages/Problems';
import { NotFound } from '@/pages/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'problems', element: <Problems /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

export const AppRouter = () => <RouterProvider router={router} />;
