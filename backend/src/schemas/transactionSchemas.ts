import { z } from 'zod';

const INCOME_CATEGORIES = [
  'salary', 'freelance', 'investment', 'gift', 'other_income',
] as const;

const EXPENSE_CATEGORIES = [
  'food', 'transport', 'housing', 'utilities', 'healthcare',
  'education', 'entertainment', 'shopping', 'personal', 'travel',
  'subscriptions', 'other_expense',
] as const;

const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES] as const;

export const createTransactionSchema = z.object({
  body: z.object({
    type: z.enum(['income', 'expense'], {
      required_error: 'Transaction type is required',
      invalid_type_error: 'Type must be income or expense',
    }),
    category: z.enum(ALL_CATEGORIES, {
      required_error: 'Category is required',
      invalid_type_error: 'Invalid category',
    }),
    amount: z
      .number({ required_error: 'Amount is required', invalid_type_error: 'Amount must be a number' })
      .positive('Amount must be positive')
      .max(1_000_000_000, 'Amount is too large'),
    description: z
      .string({ required_error: 'Description is required' })
      .trim()
      .min(1, 'Description cannot be empty')
      .max(200, 'Description cannot exceed 200 characters'),
    date: z
      .string({ required_error: 'Date is required' })
      .datetime({ message: 'Invalid date format' })
      .or(z.date())
      .transform((val) => new Date(val)),
    tags: z
      .array(z.string().trim().max(30))
      .max(10, 'Cannot have more than 10 tags')
      .optional()
      .default([]),
    notes: z
      .string()
      .trim()
      .max(500, 'Notes cannot exceed 500 characters')
      .optional(),
  }),
});

export const updateTransactionSchema = z.object({
  body: z.object({
    type: z.enum(['income', 'expense']).optional(),
    category: z.enum(ALL_CATEGORIES).optional(),
    amount: z
      .number()
      .positive('Amount must be positive')
      .max(1_000_000_000, 'Amount is too large')
      .optional(),
    description: z
      .string()
      .trim()
      .min(1, 'Description cannot be empty')
      .max(200, 'Description cannot exceed 200 characters')
      .optional(),
    date: z
      .string()
      .datetime({ message: 'Invalid date format' })
      .or(z.date())
      .transform((val) => new Date(val))
      .optional(),
    tags: z.array(z.string().trim().max(30)).max(10).optional(),
    notes: z.string().trim().max(500).optional(),
  }),
  params: z.object({
    id: z.string().min(1, 'Transaction ID is required'),
  }),
});

export const transactionQuerySchema = z.object({
  query: z.object({
    type: z.enum(['income', 'expense']).optional(),
    category: z.enum(ALL_CATEGORIES).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    search: z.string().optional(),
    minAmount: z.string().transform(Number).optional(),
    maxAmount: z.string().transform(Number).optional(),
    page: z.string().transform(Number).optional().default('1'),
    limit: z.string().transform(Number).optional().default('10'),
    sortBy: z.enum(['date', 'amount', 'createdAt', 'category']).optional().default('date'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>['body'];
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>['body'];
export type TransactionQueryInput = z.infer<typeof transactionQuerySchema>['query'];
