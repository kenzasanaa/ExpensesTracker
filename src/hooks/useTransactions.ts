// src/hooks/useTransactions.ts
import { useCallback, useEffect, useState } from 'react';
import type { Transaction, TransactionInput } from '@/types/transaction';
import { useDateRange } from '@/hooks/useDateRange';
import { api, fmtDate, getLookups } from '@/lib/api';

export interface TransactionFilters {
  page?: number;
  pageSize?: number;
  type?: string;           // single cashflow type
  types?: string[];        // multi-select cashflow — filtered only when exactly one is checked
  categories?: string[];   // category NAMES → resolved to ids here at the seam
  paymentModes?: string[]; // mode NAMES → resolved to ids here
  search?: string;
  min?: string;
  max?: string;
}

export function useTransactions(filters: TransactionFilters = {}) {
  const { dateRange } = useDateRange();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const from = fmtDate(dateRange.from);
  const to = fmtDate(dateRange.to);
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const params = new URLSearchParams({ from, to });
        // one guarded setter — undefined/empty never reaches params.set,
        // so indexed access (f.types[0] etc.) can't produce error 3
        const setIf = (key: string, v: string | number | undefined) => {
          if (v !== undefined && v !== '') params.set(key, String(v));
        };

        const f = JSON.parse(filtersKey) as TransactionFilters;
        setIf('type', f.type);
        if (f.types?.length === 1) setIf('type', f.types[0]); // both checked = no filter
        setIf('page', f.page);
        setIf('pageSize', f.pageSize);
        setIf('search', f.search);
        setIf('min', f.min);
        setIf('max', f.max);

        // Names → ids (the backend filters by id)
        if ((f.categories && f.categories.length > 0) || (f.paymentModes && f.paymentModes.length > 0)) {
          const { categories, payment_modes } = await getLookups();
          const toIds = (names: string[], table: { id: number; name: string }[]) =>
            names
              .map((n) => table.find((x) => x.name === n)?.id)
              .filter((id): id is number => id !== undefined);
          const catIds = f.categories ? toIds(f.categories, categories) : [];
          const modeIds = f.paymentModes ? toIds(f.paymentModes, payment_modes) : [];
          if (catIds.length > 0) params.set('category_ids', catIds.join(','));
          if (modeIds.length > 0) params.set('payment_mode_ids', modeIds.join(','));
        }

        const data = await api.list(params);
        if (cancelled) return;
        setTransactions(data.rows);
        setTotal(data.total);
        setError(null);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [from, to, filtersKey, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  const addTransaction = useCallback(async (t: TransactionInput) => { await api.create(t); reload(); }, [reload]);
  const updateTransaction = useCallback(async (updated: Transaction) => { await api.update(updated.id, updated); reload(); }, [reload]);
  const deleteTransaction = useCallback(async (id: string) => { await api.removeMany([id]); reload(); }, [reload]);
  const deleteTransactions = useCallback(async (ids: string[]) => { await api.removeMany(ids); reload(); }, [reload]);

  return { transactions, total, loading, error, addTransaction, updateTransaction, deleteTransaction, deleteTransactions, reload };
}