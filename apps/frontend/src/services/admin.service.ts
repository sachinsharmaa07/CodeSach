import api from '@/lib/axios';

export const adminApi = {
  submissions: (params?: Record<string, string | number>) => api.get('/admin/submissions', { params }),
  stats: () => api.get('/admin/stats'),
  users: () => api.get('/admin/users'),
};
