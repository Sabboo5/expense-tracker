import api from './api';
import { LoginCredentials, RegisterCredentials, User } from '@/types';

interface AuthResponse {
  user: User;
  accessToken: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<{ data: AuthResponse }>('/auth/login', credentials);
    return response.data.data!;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<{ data: AuthResponse }>('/auth/register', credentials);
    return response.data.data!;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  logoutAll: async (): Promise<void> => {
    await api.post('/auth/logout-all');
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<{ data: User }>('/auth/me');
    return response.data.data!;
  },

  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await api.post<{ data: { accessToken: string } }>('/auth/refresh');
    return response.data.data!;
  },
};
