import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CategoryBreakdown } from '@/types';
import { formatCurrency, CATEGORY_LABELS, CATEGORY_COLORS } from '@/utils/formatters';
import { useAppSelector } from '@/store';
import { clsx } from 'clsx';

interface CategoryChartProps {
  expenseData: CategoryBreakdown[];
  incomeData: CategoryBreakdown[];
  isLoading?: boolean;
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: {
  cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number;
}) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const CategoryChart: React.FC<CategoryChartProps> = ({
  expenseData,
  incomeData,
  isLoading = false,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const currency = user?.currency || 'USD';
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');

  const data = activeTab === 'expense' ? expenseData : incomeData;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto w-64" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Category Breakdown
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
          No {activeTab} data available
        </div>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: CATEGORY_LABELS[item.category],
    value: item.total,
    category: item.category,
    percentage: item.percentage,
    count: item.count,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          Category Breakdown
        </h3>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden text-xs">
          <button
            onClick={() => setActiveTab('expense')}
            className={clsx(
              'px-3 py-1.5 font-medium transition-colors',
              activeTab === 'expense'
                ? 'bg-red-500 text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={clsx(
              'px-3 py-1.5 font-medium transition-colors',
              activeTab === 'income'
                ? 'bg-green-500 text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            Income
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-4">
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [formatCurrency(value, currency), 'Amount']}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex-1 space-y-2 w-full">
          {chartData.slice(0, 6).map((item) => (
            <div key={item.category} className="flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS],
                  }}
                />
                <span className="text-gray-600 dark:text-gray-400 truncate">{item.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(item.value, currency)}
                </span>
                <span className="text-gray-400 dark:text-gray-500 w-10 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
          {chartData.length > 6 && (
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center pt-1">
              +{chartData.length - 6} more categories
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
