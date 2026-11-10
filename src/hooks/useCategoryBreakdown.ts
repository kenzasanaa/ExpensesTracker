import { useEffect, useState } from 'react';
import { useDateRange } from '@/hooks/useDateRange';
import { api, fmtDate, type CategoryBreakdown } from '@/lib/api';
import { CATEGORY_COLORS } from '@/lib/constants';

export interface BreakdownSlice {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

/** Doughnut data: expense share per category, within the master date range. */
export function useCategoryBreakdown() {
  const { dateRange } = useDateRange();
  const [data, setData] = useState<BreakdownSlice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const from = fmtDate(dateRange.from);
  const to = fmtDate(dateRange.to);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await api.categoryBreakdown(from, to);
        if (cancelled) return;
        const total = rows.reduce((s, r) => s + r.total_amount, 0);
        setData(rows.map((r: CategoryBreakdown) => ({
          name: r.category,
          value: r.total_amount,
          percentage: total > 0 ? Number(((r.total_amount / total) * 100).toFixed(2)) : 0,
          color: CATEGORY_COLORS[r.category] ?? '#94a3b8',
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