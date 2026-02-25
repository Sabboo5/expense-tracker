import React, { useEffect, useState, useCallback } from 'react';
import { Transaction } from '@/types';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionFilterBar } from '@/components/transactions/TransactionFilters';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';

export const TransactionsPage: React.FC = () => {
  const {
    transactions,
    pagination,
    filters,
    isLoading,
    fetchTransactions,
    createTransaction,
    editTransaction,
    deleteTransaction,
    updateFilters,
    clearFilters,
  } = useTransactions();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleAddSubmit = async (data: Parameters<typeof createTransaction>[0]) => {
    setIsSubmitting(true);
    try {
      await createTransaction(data);
      setShowAddModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (data: Parameters<typeof createTransaction>[0]) => {
    if (!editingTransaction) return;
    setIsSubmitting(true);
    try {
      await editTransaction(editingTransaction._id, data);
      setEditingTransaction(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteTransaction(deletingId);
      setDeletingId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transactions</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            {pagination ? (
              <>
                {pagination.total} transaction{pagination.total !== 1 ? 's' : ''} found
              </>
            ) : (
              'Manage your income and expenses'
            )}
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

      {/* Filters */}
      <TransactionFilterBar
        filters={filters}
        onChange={updateFilters}
        onReset={clearFilters}
      />

      {/* List */}
      <TransactionList
        transactions={transactions}
        onEdit={setEditingTransaction}
        onDelete={setDeletingId}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {pagination && (
        <Pagination pagination={pagination} onPageChange={handlePageChange} />
      )}

      {/* Add Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Transaction"
        size="lg"
      >
        <TransactionForm
          onSubmit={handleAddSubmit}
          onCancel={() => setShowAddModal(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        title="Edit Transaction"
        size="lg"
      >
        {editingTransaction && (
          <TransactionForm
            transaction={editingTransaction}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingTransaction(null)}
            isLoading={isSubmitting}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
