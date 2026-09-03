import { createContext } from 'react';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DateRangeContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

export const DateRangeContext = createContext<DateRangeContextType | null>(null);