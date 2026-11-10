// src/hooks/useStats.ts
import { useEffect, useState } from 'react';
import { useDateRange } from '@/hooks/useDateRange';
import { api, fmtDate, type Stats } from '@/lib/api';

export function useStats() {
  const { dateRange } = useDateRange();
  const [stats, setStats] = useState<Stats>({
    total_income: 0,
    total_expense: 0,
    net_balance: 0,
    transaction_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const from = fmtDate(dateRange.from);
  const to = fmtDate(dateRange.to);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.stats(from, to);
        if (!cancelled) { setStats(data); setError(null); }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [from, to]);

  return { ...stats, loading, error };
}