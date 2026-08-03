import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Home } from '@/pages/Home';
import { Problems } from '@/pages/Problems';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { NotFound } from '@/pages/NotFound';
import { AuthCallback } from '@/pages/AuthCallback';

const ProblemDetail = lazy(() =>
  import('@/pages/ProblemDetail').then((m) => ({ default: m.ProblemDetail })),
);
const Profile = lazy(() => import('@/pages/Profile').then((m) => ({ default: m.Profile })));
const Leaderboard = lazy(() =>
  import('@/pages/Leaderboard').then((m) => ({ default: m.Leaderboard })),
);
const DsaSheet = lazy(() => import('@/pages/DsaSheet').then((m) => ({ default: m.default })));
const AdminDashboard = lazy(() =>
  import('@/pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
);
const AddProblem = lazy(() =>
  import('@/pages/admin/AddProblem').then((m) => ({ default: m.AddProblem })),
);
const AdminProblems = lazy(() =>
  import('@/pages/admin/AdminProblems').then((m) => ({ default: m.AdminProblems })),
);
const EditProblem = lazy(() =>
  import('@/pages/admin/EditProblem').then((m) => ({ default: m.EditProblem })),
);
const AdminSubmissions = lazy(() =>
  import('@/pages/admin/AdminSubmissions').then((m) => ({ default: m.AdminSubmissions })),
);

const withSuspense = (el) => (
  <Suspense fallback={<div className="text-neutral-500 text-sm p-8">Loading...</div>}>
    {el}
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'problems', element: <Problems /> },
      { path: 'sheet', element: withSuspense(<DsaSheet />) },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'auth/callback', element: <AuthCallback /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'profile', element: withSuspense(<Profile />) },
          { path: 'problems/:slug', element: withSuspense(<ProblemDetail />) },
          { path: 'leaderboard', element: withSuspense(<Leaderboard />) },
        ],
      },
      {
        element: <ProtectedRoute role="admin" />,
        children: [
          { path: 'admin', element: withSuspense(<AdminDashboard />) },
          { path: 'admin/problems', element: withSuspense(<AdminProblems />) },
          { path: 'admin/problems/new', element: withSuspense(<AddProblem />) },
          { path: 'admin/problems/:id/edit', element: withSuspense(<EditProblem />) },
          { path: 'admin/submissions', element: withSuspense(<AdminSubmissions />) },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

export const AppRouter = () => <RouterProvider router={router} />;
