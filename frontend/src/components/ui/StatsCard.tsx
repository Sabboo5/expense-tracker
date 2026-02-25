import React from 'react';
import { clsx } from 'clsx';

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  variant?: 'default' | 'income' | 'expense' | 'balance';
  className?: string;
}

const variantStyles = {
  default: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
  income: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  expense: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  balance: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
};

const iconStyles = {
  default: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  income: 'bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400',
  expense: 'bg-red-100 dark:bg-red-800/50 text-red-600 dark:text-red-400',
  balance: 'bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className,
}) => {
  return (
    <div
      className={clsx(
        'rounded-xl border p-5 flex flex-col gap-3 animate-fade-in',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={clsx('p-2.5 rounded-lg', iconStyles[variant])}>{icon}</div>
      </div>

      {trend && (
        <div className="flex items-center gap-1">
          <span
            className={clsx(
              'text-xs font-medium',
              trend.value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            )}
          >
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{trend.label}</span>
        </div>
      )}
    </div>
  );
};
