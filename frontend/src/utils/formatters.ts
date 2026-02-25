import { TransactionCategory, TransactionType } from '@/types';
import { format, parseISO, isValid } from 'date-fns';

export const formatCurrency = (
  amount: number,
  currency = 'USD',
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
};

export const formatDate = (date: string | Date, formatStr = 'MMM dd, yyyy'): string => {
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsed)) return 'Invalid date';
    return format(parsed, formatStr);
  } catch {
    return 'Invalid date';
  }
};

export const formatDateInput = (date: string | Date): string => {
  try {
    const parsed = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(parsed)) return '';
    return format(parsed, "yyyy-MM-dd'T'HH:mm");
  } catch {
    return '';
  }
};

export const formatNumber = (num: number): string => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
};

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  salary: 'Salary',
  freelance: 'Freelance',
  investment: 'Investment',
  gift: 'Gift',
  other_income: 'Other Income',
  food: 'Food & Dining',
  transport: 'Transport',
  housing: 'Housing',
  utilities: 'Utilities',
  healthcare: 'Healthcare',
  education: 'Education',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  personal: 'Personal',
  travel: 'Travel',
  subscriptions: 'Subscriptions',
  other_expense: 'Other Expense',
};

export const CATEGORY_ICONS: Record<TransactionCategory, string> = {
  salary: '💼',
  freelance: '💻',
  investment: '📈',
  gift: '🎁',
  other_income: '💰',
  food: '🍔',
  transport: '🚗',
  housing: '🏠',
  utilities: '💡',
  healthcare: '🏥',
  education: '📚',
  entertainment: '🎬',
  shopping: '🛍️',
  personal: '👤',
  travel: '✈️',
  subscriptions: '📱',
  other_expense: '📦',
};

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  salary: '#3b82f6',
  freelance: '#8b5cf6',
  investment: '#06b6d4',
  gift: '#ec4899',
  other_income: '#6366f1',
  food: '#f59e0b',
  transport: '#10b981',
  housing: '#ef4444',
  utilities: '#f97316',
  healthcare: '#14b8a6',
  education: '#8b5cf6',
  entertainment: '#ec4899',
  shopping: '#06b6d4',
  personal: '#6366f1',
  travel: '#84cc16',
  subscriptions: '#a855f7',
  other_expense: '#64748b',
};

export const INCOME_CATEGORIES: TransactionCategory[] = [
  'salary', 'freelance', 'investment', 'gift', 'other_income',
];

export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  'food', 'transport', 'housing', 'utilities', 'healthcare',
  'education', 'entertainment', 'shopping', 'personal', 'travel',
  'subscriptions', 'other_expense',
];

export const getCategoriesForType = (type: TransactionType): TransactionCategory[] => {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
};

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];
