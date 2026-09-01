import { useState, useCallback, useEffect } from 'react';
import { Transaction, TransactionFormData } from '@/types/transaction';

const STORAGE_KEY = 'expense-tracker-transactions';

// Optional: one demo transaction so the dashboard isn't completely blank on first visit
// Remove this if you want a fully empty start
const DEMO_DATA: Transaction[] = [
  {
    id: crypto.randomUUID(),
    type: 'income',
    amount: 5000,
    date: new Date(),
    time: '09:00',
    description: 'Salary',
    category: 'Others',
    paymentMode: 'Bank Transfer',
  },
];

function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEMO_DATA; // First visit → show demo, or return [] for empty start
    const parsed = JSON.parse(raw);
    // Dates come back as strings from JSON, convert them back to Date objects
    return parsed.map((t: Transaction) => ({
      ...t,
      date: new Date(t.date),
    }));
  } catch {
    return DEMO_DATA;
  }
}

function saveTransactions(transactions: Transaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);

  // Auto-save to localStorage whenever transactions change
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  const addTransaction = useCallback((data: TransactionFormData) => {
    const newTransaction: Transaction = {
      ...data,
      id: crypto.randomUUID(),
    };
    setTransactions((prev) => [...prev, newTransaction]);
  }, []);

  const updateTransaction = useCallback((id: string, data: TransactionFormData) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...data, id } : t))
    );
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setTransactions([]);
  }, []);

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearAll,
  };
}