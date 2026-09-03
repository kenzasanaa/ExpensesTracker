import { useState, type ReactNode } from 'react';
import { DateRangeContext } from './DateRangeContext';

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [dateRange, setDateRange] = useState({
    from: new Date(2017, 5, 1),
    to: new Date(2017, 10, 30),
  });

  return (
    <DateRangeContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </DateRangeContext.Provider>
  );
}