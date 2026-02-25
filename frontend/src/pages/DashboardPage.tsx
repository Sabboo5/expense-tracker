import React, { useEffect, useState } from 'react';
import { Analytics } from '@/types';
import { transactionService } from '@/services/transactionService';
import { StatsCard } from '@/components/ui/StatsCard';
import { MonthlyChart } from '@/components/dashboard/MonthlyChart';
import { CategoryChart } from '@/components/dashboard/CategoryChart';
import { TransactionList } from '@/components/transactions/TransactionList';
import { formatCurrency } from '@/utils/formatters';
import { useAppSelector } from '@/store';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { useTransactions } from '@/hooks/useTransactions';
import toast from 'react-hot-toast';

export const DashboardPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedYear] = useState(new Date().getFullYear());
  const { createTransaction, fetchTransactions } = useTransactions();

  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const data = await transactionService.getAnalytics(selectedYear);
      setAnalytics(data);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedYear]);

  const handleAddTransaction = async (data: Parameters<typeof createTransaction>[0]) => {
    setIsSubmitting(true);
    try {
      await createTransaction(data);
      setShowAddModal(false);
      fetchAnalytics();
    } finally {
      setIsSubmitting(false);
    }
  };

  const currency = user?.currency || 'USD';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Here's your financial summary
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Add Transaction
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Balance"
          value={
            isLoadingAnalytics
              ? '...'
              : formatCurrency(analytics?.summary.balance ?? 0, currency)
          }
          subtitle="Net balance"
          variant="balance"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          }
        />
        <StatsCard
          title="Total Income"
          value={
            isLoadingAnalytics
              ? '...'
              : formatCurrency(analytics?.summary.totalIncome ?? 0, currency)
          }
          subtitle="All time"
          variant="income"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        />
        <StatsCard
          title="Total Expenses"
          value={
            isLoadingAnalytics
              ? '...'
              : formatCurrency(analytics?.summary.totalExpense ?? 0, currency)
          }
          subtitle="All time"
          variant="expense"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          }
        />
        <StatsCard
          title="Transactions"
          value={
            isLoadingAnalytics ? '...' : String(analytics?.summary.totalTransactions ?? 0)
          }
          subtitle="Total recorded"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyChart
            data={analytics?.monthlyTrends ?? []}
            isLoading={isLoadingAnalytics}
          />
        </div>
        <CategoryChart
          expenseData={analytics?.expenseByCategory ?? []}
          incomeData={analytics?.incomeByCategory ?? []}
          isLoading={isLoadingAnalytics}
        />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Recent Transactions
          </h3>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/transactions'}>
            View all
          </Button>
        </div>
        <TransactionList
          transactions={analytics?.recentTransactions ?? []}
          onEdit={() => {}}
          onDelete={() => {}}
          isLoading={isLoadingAnalytics}
          compact
        />
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Transaction"
        size="lg"
      >
        <TransactionForm
          onSubmit={handleAddTransaction}
          onCancel={() => setShowAddModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
};
