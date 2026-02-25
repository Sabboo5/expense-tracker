import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  setTransactions,
  addTransaction,
  updateTransaction,
  removeTransaction,
  setLoading,
  setError,
  setFilters,
  resetFilters,
} from '@/store/transactionSlice';
import { transactionService } from '@/services/transactionService';
import { TransactionFormData, TransactionFilters } from '@/types';
import toast from 'react-hot-toast';

export const useTransactions = () => {
  const dispatch = useAppDispatch();
  const { transactions, pagination, filters, isLoading, error } = useAppSelector(
    (state) => state.transactions
  );
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchTransactions = useCallback(
    async (overrideFilters?: Partial<TransactionFilters>) => {
      dispatch(setLoading(true));
      dispatch(setError(null));
      try {
        const activeFilters = overrideFilters
          ? { ...filters, ...overrideFilters }
          : filters;
        const result = await transactionService.getAll(activeFilters);
        dispatch(
          setTransactions({
            transactions: result.items,
            pagination: result.pagination,
          })
        );
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        const message = error.response?.data?.message || 'Failed to load transactions';
        dispatch(setError(message));
        toast.error(message);
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, filters]
  );

  const createTransaction = async (data: TransactionFormData) => {
    try {
      const transaction = await transactionService.create(data);
      dispatch(addTransaction(transaction));
      toast.success('Transaction added successfully');
      return transaction;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Failed to create transaction';
      toast.error(message);
      throw err;
    }
  };

  const editTransaction = async (id: string, data: Partial<TransactionFormData>) => {
    try {
      const transaction = await transactionService.update(id, data);
      dispatch(updateTransaction(transaction));
      toast.success('Transaction updated successfully');
      return transaction;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Failed to update transaction';
      toast.error(message);
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await transactionService.delete(id);
      dispatch(removeTransaction(id));
      toast.success('Transaction deleted successfully');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const message = error.response?.data?.message || 'Failed to delete transaction';
      toast.error(message);
      throw err;
    }
  };

  const updateFilters = (newFilters: Partial<TransactionFilters>) => {
    dispatch(setFilters({ ...newFilters, page: 1 }));
  };

  const clearFilters = () => {
    dispatch(resetFilters());
  };

  return {
    transactions,
    pagination,
    filters,
    isLoading,
    analyticsLoading,
    error,
    fetchTransactions,
    createTransaction,
    editTransaction,
    deleteTransaction,
    updateFilters,
    clearFilters,
  };
};
