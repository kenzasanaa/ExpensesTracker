// src/hooks/useLookups.ts
import { useEffect, useState } from 'react';
import { getLookups, type Lookups } from '@/lib/api';

/** Dropdown options for the form: { categories, paymentModes, loading } */
export function useLookups() {
  const [lookups, setLookups] = useState<Lookups>({ categories: [], payment_modes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getLookups()
      .then((l) => { if (!cancelled) setLookups(l); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { categories: lookups.categories, paymentModes: lookups.payment_modes, loading };
}