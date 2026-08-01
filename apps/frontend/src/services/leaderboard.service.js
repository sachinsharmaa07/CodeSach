import api from '@/lib/axios';

export const leaderboardApi = {
  top: (limit = 50) => api.get('/leaderboard', { params: { limit } })
};