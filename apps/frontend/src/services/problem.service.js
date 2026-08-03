import api from '@/lib/axios';

export const problemApi = {
  list: (params) => api.get('/problems', { params }),
  getBySlug: (slug) => api.get(`/problems/${slug}`),
  create: (data) => api.post('/problems', data),
  update: (id, data) => api.patch(`/problems/${id}`, data),
};

export const submissionApi = {
  run: (data) => api.post('/submissions/run', data),
  submit: (data) => api.post('/submissions/submit', data),
  mine: (problemId) => api.get('/submissions/me', { params: problemId ? { problemId } : {} }),
};
