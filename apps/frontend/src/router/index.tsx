import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Home } from '@/pages/Home';
import { Problems } from '@/pages/Problems';
import { ProblemDetail } from '@/pages/ProblemDetail';
import { NotFound } from '@/pages/NotFound';
import { AuthCallback } from '@/pages/AuthCallback';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Profile } from '@/pages/Profile';
import { AddProblem } from '@/pages/admin/AddProblem';
import { Leaderboard } from '@/pages/Leaderboard';
import { AdminSubmissions } from '@/pages/admin/AdminSubmissions';
import { AdminProblems } from '@/pages/admin/AdminProblems';
import { EditProblem } from '@/pages/admin/EditProblem';

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
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'profile', element: <Profile /> },
          { path: 'leaderboard', element: <Leaderboard /> },
          { path: 'problems/:slug', element: <ProblemDetail /> },
        ],
      },
      {
        element: <ProtectedRoute role="admin" />,
        children: [
          { path: 'admin/problems', element: <AdminProblems /> },
          { path: 'admin/problems/new', element: <AddProblem /> },
          { path: 'admin/problems/:id/edit', element: <EditProblem /> },
          { path: 'admin/submissions', element: <AdminSubmissions /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

export const AppRouter = () => <RouterProvider router={router} />;
