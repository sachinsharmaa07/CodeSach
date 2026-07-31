import api from '@/lib/axios';

export const problemApi = {
  list: (params?: Record<string, string>) => api.get('/problems', { params }),
  getBySlug: (slug: string) => api.get(`/problems/${slug}`),
  create: (data: any) => api.post('/problems', data),
  update: (id: string, data: any) => api.patch(`/problems/${id}`, data),
};

export const submissionApi = {
  run: (data: { problemId: string; code: string; language: string }) => api.post('/submissions/run', data),
  submit: (data: { problemId: string; code: string; language: string }) => api.post('/submissions/submit', data),
  mine: (problemId?: string) => api.get('/submissions/me', { params: problemId ? { problemId } : {} }),
};
