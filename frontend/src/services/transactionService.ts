import api from './api';
import {
  Transaction,
  TransactionFormData,
  TransactionFilters,
  PaginatedResponse,
  Analytics,
} from '@/types';

export const transactionService = {
  getAll: async (
    filters: TransactionFilters = {}
  ): Promise<PaginatedResponse<Transaction>> => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined)
    );
    const response = await api.get<{ data: PaginatedResponse<Transaction> }>('/transactions', {
      params,
    });
    return response.data.data!;
  },

  getById: async (id: string): Promise<Transaction> => {
    const response = await api.get<{ data: Transaction }>(`/transactions/${id}`);
    return response.data.data!;
  },

  create: async (data: TransactionFormData): Promise<Transaction> => {
    const response = await api.post<{ data: Transaction }>('/transactions', data);
    return response.data.data!;
  },

  update: async (id: string, data: Partial<TransactionFormData>): Promise<Transaction> => {
    const response = await api.put<{ data: Transaction }>(`/transactions/${id}`, data);
    return response.data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  },

  getAnalytics: async (year?: number): Promise<Analytics> => {
    const response = await api.get<{ data: Analytics }>('/transactions/analytics', {
      params: year ? { year } : {},
    });
    return response.data.data!;
  },
};
