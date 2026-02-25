import React, { useState } from 'react';
import { TransactionFilters, TransactionType, TransactionCategory } from '@/types';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CATEGORY_LABELS, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/utils/formatters';
import { clsx } from 'clsx';

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onChange: (filters: Partial<TransactionFilters>) => void;
  onReset: () => void;
}

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
];

const allCategoryOptions = [
  { value: '', label: 'All Categories' },
  ...INCOME_CATEGORIES.map((c) => ({ value: c, label: `↑ ${CATEGORY_LABELS[c]}` })),
  ...EXPENSE_CATEGORIES.map((c) => ({ value: c, label: `↓ ${CATEGORY_LABELS[c]}` })),
];

const sortByOptions = [
  { value: 'date', label: 'Date' },
  { value: 'amount', label: 'Amount' },
  { value: 'category', label: 'Category' },
  { value: 'createdAt', label: 'Created' },
];

const sortOrderOptions = [
  { value: 'desc', label: 'Newest First' },
  { value: 'asc', label: 'Oldest First' },
];

const limitOptions = [
  { value: '10', label: '10 per page' },
  { value: '20', label: '20 per page' },
  { value: '50', label: '50 per page' },
];

export const TransactionFilterBar: React.FC<TransactionFiltersProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters =
    filters.type ||
    filters.category ||
    filters.search ||
    filters.startDate ||
    filters.endDate ||
    filters.minAmount ||
    filters.maxAmount;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      {/* Primary filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search transactions..."
            value={filters.search || ''}
            onChange={(e) => onChange({ search: e.target.value })}
            leftIcon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        {/* Type filter */}
        <div className="w-full sm:w-40">
          <Select
            options={typeOptions}
            value={filters.type || ''}
            onChange={(e) => onChange({ type: e.target.value as TransactionType | '' })}
          />
        </div>

        {/* Category filter */}
        <div className="w-full sm:w-48">
          <Select
            options={allCategoryOptions}
            value={filters.category || ''}
            onChange={(e) => onChange({ category: e.target.value as TransactionCategory | '' })}
          />
        </div>

        {/* Advanced toggle */}
        <Button
          variant="ghost"
          size="md"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={clsx(showAdvanced && 'bg-gray-100 dark:bg-gray-700')}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          }
        >
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-primary-500 ml-1 flex-shrink-0" />
          )}
        </Button>
      </div>

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-gray-100 dark:border-gray-700 animate-slide-up">
          <Input
            label="From date"
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => onChange({ startDate: e.target.value })}
          />
          <Input
            label="To date"
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => onChange({ endDate: e.target.value })}
          />
          <Input
            label="Min amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={filters.minAmount || ''}
            onChange={(e) => onChange({ minAmount: e.target.value })}
          />
          <Input
            label="Max amount"
            type="number"
            min="0"
            step="0.01"
            placeholder="No limit"
            value={filters.maxAmount || ''}
            onChange={(e) => onChange({ maxAmount: e.target.value })}
          />
          <Select
            label="Sort by"
            options={sortByOptions}
            value={filters.sortBy || 'date'}
            onChange={(e) => onChange({ sortBy: e.target.value as TransactionFilters['sortBy'] })}
          />
          <Select
            label="Sort order"
            options={sortOrderOptions}
            value={filters.sortOrder || 'desc'}
            onChange={(e) => onChange({ sortOrder: e.target.value as 'asc' | 'desc' })}
          />
          <Select
            label="Items per page"
            options={limitOptions}
            value={String(filters.limit || 10)}
            onChange={(e) => onChange({ limit: Number(e.target.value) })}
          />

          {hasActiveFilters && (
            <div className="flex items-end">
              <Button variant="ghost" size="md" onClick={onReset} fullWidth
                leftIcon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              >
                Reset filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
