import { useContext } from 'react';
import { DateRangeContext } from '@/context/DateRangeContext';

export function useDateRange() {
  const ctx = useContext(DateRangeContext);
  if (!ctx) throw new Error('useDateRange must be used within DateRangeProvider');
  return ctx;
}