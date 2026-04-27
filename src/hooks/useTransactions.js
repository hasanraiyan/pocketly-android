import { useCallback } from 'react';
import { usePocketly } from '../context/PocketlyContext';

export function useTransactions() {
  const {
    fetchBootstrap,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    transactions,
    isLoading,
    error,
  } = usePocketly();

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
}

export function useTransactionFilters() {
  const { transactions } = usePocketly();

  const filterBySearch = useCallback((searchTerm) => {
    if (!transactions) return [];
    if (!searchTerm.trim()) return transactions;
    const q = searchTerm.toLowerCase();
    return transactions.filter(
      (t) =>
        t.note?.toLowerCase().includes(q) ||
        t.category?.name?.toLowerCase().includes(q) ||
        t.account?.name?.toLowerCase().includes(q)
    );
  }, [transactions]);

  const calculateTotals = useCallback((filteredTransactions) => {
    if (!filteredTransactions) return { income: 0, expense: 0, net: 0 };
    const income = filteredTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = filteredTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, net: income - expense };
  }, []);

  return { filterBySearch, calculateTotals };
}