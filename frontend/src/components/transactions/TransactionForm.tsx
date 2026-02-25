import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Transaction, TransactionFormData } from '@/types';
import { Input, Select, TextArea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  CATEGORY_LABELS,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  getCategoriesForType,
} from '@/utils/formatters';
import { format } from 'date-fns';
import { clsx } from 'clsx';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required'),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required').max(200),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(500).optional(),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction?.type || 'expense',
      category: transaction?.category || '',
      amount: transaction?.amount || undefined,
      description: transaction?.description || '',
      date: transaction?.date
        ? format(new Date(transaction.date), "yyyy-MM-dd'T'HH:mm")
        : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      notes: transaction?.notes || '',
      tags: transaction?.tags?.join(', ') || '',
    },
  });

  const selectedType = watch('type');

  // Reset category when type changes (only on type change, not initial render)
  const handleTypeChange = (type: 'income' | 'expense') => {
    setValue('type', type);
    setValue('category', '');
  };

  const categoryOptions = getCategoriesForType(selectedType).map((cat) => ({
    value: cat,
    label: `${CATEGORY_LABELS[cat]}`,
  }));

  const onFormSubmit = async (data: FormData) => {
    const tags = data.tags
      ? data.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];

    await onSubmit({
      type: data.type,
      category: data.category as TransactionFormData['category'],
      amount: data.amount,
      description: data.description,
      date: new Date(data.date).toISOString(),
      notes: data.notes || undefined,
      tags,
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5" noValidate>
      {/* Type Toggle */}
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
          Transaction Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={clsx(
              'flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all',
              selectedType === 'income'
                ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:border-green-500'
                : 'border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600'
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Income
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={clsx(
              'flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all',
              selectedType === 'expense'
                ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-500'
                : 'border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600'
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
            Expense
          </button>
        </div>
      </div>

      {/* Category */}
      <Select
        label="Category"
        required
        options={categoryOptions}
        placeholder="Select a category"
        error={errors.category?.message}
        {...register('category')}
      />

      {/* Amount */}
      <Input
        label="Amount"
        type="number"
        required
        step="0.01"
        min="0.01"
        placeholder="0.00"
        error={errors.amount?.message}
        leftIcon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        {...register('amount', { valueAsNumber: true })}
      />

      {/* Description */}
      <Input
        label="Description"
        type="text"
        required
        placeholder="e.g., Grocery shopping at Walmart"
        error={errors.description?.message}
        {...register('description')}
      />

      {/* Date */}
      <Input
        label="Date & Time"
        type="datetime-local"
        required
        error={errors.date?.message}
        {...register('date')}
      />

      {/* Notes */}
      <TextArea
        label="Notes (optional)"
        placeholder="Add any additional notes..."
        error={errors.notes?.message}
        {...register('notes')}
      />

      {/* Tags */}
      <Input
        label="Tags (optional)"
        type="text"
        placeholder="e.g., groceries, work, monthly (comma separated)"
        hint="Separate tags with commas"
        error={errors.tags?.message}
        {...register('tags')}
      />

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading} fullWidth>
          {transaction ? 'Update' : 'Add'} Transaction
        </Button>
      </div>
    </form>
  );
};
