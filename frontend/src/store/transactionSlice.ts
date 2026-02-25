import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, TransactionFilters, PaginationMeta } from '@/types';

interface TransactionState {
  transactions: Transaction[];
  pagination: PaginationMeta | null;
  filters: TransactionFilters;
  isLoading: boolean;
  error: string | null;
  selectedTransaction: Transaction | null;
}

const initialState: TransactionState = {
  transactions: [],
  pagination: null,
  filters: {
    page: 1,
    limit: 10,
    sortBy: 'date',
    sortOrder: 'desc',
  },
  isLoading: false,
  error: null,
  selectedTransaction: null,
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions: (
      state,
      action: PayloadAction<{ transactions: Transaction[]; pagination: PaginationMeta }>
    ) => {
      state.transactions = action.payload.transactions;
      state.pagination = action.payload.pagination;
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.transactions.unshift(action.payload);
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.transactions.findIndex((t) => t._id === action.payload._id);
      if (index !== -1) {
        state.transactions[index] = action.payload;
      }
    },
    removeTransaction: (state, action: PayloadAction<string>) => {
      state.transactions = state.transactions.filter((t) => t._id !== action.payload);
    },
    setFilters: (state, action: PayloadAction<Partial<TransactionFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedTransaction: (state, action: PayloadAction<Transaction | null>) => {
      state.selectedTransaction = action.payload;
    },
  },
});

export const {
  setTransactions,
  addTransaction,
  updateTransaction,
  removeTransaction,
  setFilters,
  resetFilters,
  setLoading,
  setError,
  setSelectedTransaction,
} = transactionSlice.actions;

export default transactionSlice.reducer;
