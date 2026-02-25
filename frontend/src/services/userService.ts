import api from './api';
import { User } from '@/types';

export const userService = {
  updateProfile: async (data: { name?: string; currency?: string }): Promise<User> => {
    const response = await api.put<{ data: User }>('/users/profile', data);
    return response.data.data!;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> => {
    await api.put('/users/change-password', data);
  },

  deleteAccount: async (password: string): Promise<void> => {
    await api.delete('/users/account', { data: { password } });
  },
};
