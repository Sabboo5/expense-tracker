// ─── Auth Types ─────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  avatar?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  currency?: string;
}

// ─── Transaction Types ───────────────────────────────────────────────────────
export type TransactionType = 'income' | 'expense';

export type IncomeCategory =
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'gift'
  | 'other_income';

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'housing'
  | 'utilities'
  | 'healthcare'
  | 'education'
  | 'entertainment'
  | 'shopping'
  | 'personal'
  | 'travel'
  | 'subscriptions'
  | 'other_expense';

export type TransactionCategory = IncomeCategory | ExpenseCategory;

export interface Transaction {
  _id: string;
  user: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionFormData {
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: string;
  tags?: string[];
  notes?: string;
}

export interface TransactionFilters {
  type?: TransactionType | '';
  category?: TransactionCategory | '';
  startDate?: string;
  endDate?: string;
  search?: string;
  minAmount?: string;
  maxAmount?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'amount' | 'createdAt' | 'category';
  sortOrder?: 'asc' | 'desc';
}

// ─── Pagination ──────────────────────────────────────────────────────────────
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// ─── Analytics Types ─────────────────────────────────────────────────────────
export interface AnalyticsSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalTransactions: number;
}

export interface MonthlyTrend {
  month: string;
  monthNum: number;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdown {
  category: TransactionCategory;
  total: number;
  count: number;
  percentage: string;
}

export interface Analytics {
  summary: AnalyticsSummary;
  monthlyTrends: MonthlyTrend[];
  expenseByCategory: CategoryBreakdown[];
  incomeByCategory: CategoryBreakdown[];
  recentTransactions: Transaction[];
}

// ─── API Response Types ──────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// ─── UI Types ────────────────────────────────────────────────────────────────
export type Theme = 'light' | 'dark';

export interface ThemeState {
  theme: Theme;
}
