import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.VITE_API_URL || 'http://localhost:4000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  telegramAuth: (initData: string) =>
    api.post('/auth/telegram', { initData }),
  verify: (token: string) =>
    api.post('/auth/verify', { token }),
};

export const playersAPI = {
  getProfile: (id: string) => api.get(`/players/${id}`),
  updateProfile: (id: string, data: any) =>
    api.patch(`/players/${id}`, data),
  getLeaderboard: (limit: number = 100) =>
    api.get(`/players/leaderboard?limit=${limit}`),
  addTokens: (id: string, amount: number) =>
    api.patch(`/players/${id}/tokens`, { amount }),
};

export const matchesAPI = {
  create: (data: any) => api.post('/matches', data),
  getById: (id: string) => api.get(`/matches/${id}`),
  getByPlayer: (playerId: string, limit: number = 20) =>
    api.get(`/matches/player/${playerId}?limit=${limit}`),
  getStats: (playerId: string) =>
    api.get(`/matches/stats/${playerId}`),
  complete: (id: string, data: any) =>
    api.post(`/matches/${id}/complete`, data),
};

export default api;
