import { useEffect, useState } from 'react';
import { useDateRange } from '@/hooks/useDateRange';
import { api, fmtDate } from '@/lib/api';

interface BalancePoint {
  date: string;    // 'Oct 3' — display label
  balance: number;
}

/** Area-chart data: running balance per day, computed by the DB (window function). */
export function useBalanceHistory() {
  const { dateRange } = useDateRange();
  const [data, setData] = useState<BalancePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const from = fmtDate(dateRange.from);
  const to = fmtDate(dateRange.to);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await api.balanceHistory(from, to);
        if (cancelled) return;
        setData(rows.map((r) => ({
          date: new Date(`${r.txn_date}T00:00:00`).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric',
          }),
          balance: Number(r.running_balance),
        })));
        setError(null);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [from, to]);

  return { data, loading, error };
}