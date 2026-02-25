import React from 'react';
import { Transaction } from '@/types';
import { formatCurrency, formatDate, CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS } from '@/utils/formatters';
import { useAppSelector } from '@/store';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onEdit,
  onDelete,
  compact = false,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const isIncome = transaction.type === 'income';
  const categoryColor = CATEGORY_COLORS[transaction.category];
  const categoryIcon = CATEGORY_ICONS[transaction.category];
  const categoryLabel = CATEGORY_LABELS[transaction.category];

  return (
    <div
      className={clsx(
        'flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl border',
        'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
        'transition-all duration-150 group',
        compact ? 'p-3' : 'p-4'
      )}
    >
      {/* Category Icon */}
      <div
        className={clsx(
          'flex-shrink-0 flex items-center justify-center rounded-xl text-lg',
          compact ? 'w-9 h-9' : 'w-11 h-11'
        )}
        style={{ backgroundColor: `${categoryColor}20` }}
      >
        <span role="img" aria-label={categoryLabel}>
          {categoryIcon}
        </span>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {transaction.description}
          </p>
          {transaction.tags.length > 0 && !compact && (
            <div className="flex gap-1 flex-shrink-0">
              {transaction.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                >
                  #{tag}
                </span>
              ))}
              {transaction.tags.length > 2 && (
                <span className="text-xs text-gray-400">+{transaction.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="text-xs font-medium px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${categoryColor}15`, color: categoryColor }}
          >
            {categoryLabel}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatDate(transaction.date, 'MMM dd, yyyy')}
          </span>
        </div>
      </div>

      {/* Amount & Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <span
          className={clsx(
            'text-sm font-semibold tabular-nums',
            isIncome
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          )}
        >
          {isIncome ? '+' : '-'}
          {formatCurrency(transaction.amount, user?.currency || 'USD')}
        </span>

        {/* Action buttons - visible on hover */}
        {!compact && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(transaction)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 dark:hover:text-primary-400 transition-colors"
              aria-label="Edit transaction"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(transaction._id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
              aria-label="Delete transaction"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
