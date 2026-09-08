import { useState } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { type DateRange } from 'react-day-picker'; // Required for correct typing

import { useDateRange } from '@/hooks/useDateRange';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function DateRangePicker() {
  const { dateRange, setDateRange } = useDateRange();
  const [isOpen, setIsOpen] = useState(false);

  // 1. Correctly type the state using DateRange from react-day-picker
  const [tempRange, setTempRange] = useState<DateRange | undefined>({
    from: dateRange.from,
    to: dateRange.to,
  });

  // 2. Sync logic moved from useEffect to this handler to prevent cascading renders
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setTempRange({
        from: dateRange.from,
        to: dateRange.to,
      });
    }
  };

  // Quick Select Helper functions
  const selectLastMonth = () => {
    const previousMonth = subMonths(new Date(), 1);
    setTempRange({
      from: startOfMonth(previousMonth),
      to: endOfMonth(previousMonth),
    });
  };

  const selectLast3Months = () => {
    const end = new Date();
    const start = startOfMonth(subMonths(end, 2));
    setTempRange({ from: start, to: end });
  };

  const selectAllTime = () => {
    setTempRange({
      from: new Date(2025, 1, 1),
      to: new Date(2030, 11, 31),
    });
  };

  const handleApply = () => {
    if (tempRange?.from && tempRange?.to) {
      setDateRange({
        from: tempRange.from,
        to: tempRange.to,
      });
      setIsOpen(false);
    }
  };

  
  const handleCancel = () => {
    setIsOpen(false);
  };

  const daysDifference = tempRange?.from && tempRange?.to
    ? differenceInDays(tempRange.to, tempRange.from) + 1
    : 0;

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      {/* 
        3. Styled PopoverTrigger directly to avoid 'asChild' TypeScript issues 
        and nested button conflicts.
      */}
      <PopoverTrigger className="inline-flex h-9 items-center justify-start rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 gap-2">
  <CalendarIcon className="h-4 w-4 text-slate-500" />
  {dateRange.from && dateRange.to ? (
    <>
      {/* Desktop Display format */}
      <span className="hidden sm:inline text-slate-600">
        {format(dateRange.from, 'MM/dd/yyyy')} - {format(dateRange.to, 'MM/dd/yyyy')}
      </span>
      {/* Mobile Display format */}
      <span className="sm:hidden text-slate-600">
        {format(dateRange.from, 'MM/dd')} - {format(dateRange.to, 'MM/dd')}
      </span>
    </>
  ) : (
    <span>Pick a date range</span>
  )}
</PopoverTrigger>

      <PopoverContent className="w-auto p-0 border shadow-md flex flex-col" align="end">
        {/* Top Header Panel */}
        <div className="flex items-center justify-between border-b px-4 py-3 bg-slate-50/50">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
            <span>
              {tempRange?.from ? format(tempRange.from, 'MMM d, yyyy') : '...'}
            </span>
            <span className="text-slate-400">→</span>
            <span>
              {tempRange?.to ? format(tempRange.to, 'MMM d, yyyy') : '...'}
            </span>
          </div>
          {daysDifference > 0 && (
            <span className="text-xs text-slate-500 font-medium">
              {daysDifference} days
            </span>
          )}
        </div>

        {/* Calendar and Sidebar presets layout */}
        <div className="flex flex-col md:flex-row">
          
          {/* Dual calendars side-by-side */}
          <div className="p-1">
            <Calendar
              mode="range"
              defaultMonth={tempRange?.from || new Date()}
              selected={tempRange}
              onSelect={setTempRange}
              numberOfMonths={2}
            />
          </div>

          {/* Quick Shortcuts Sidebar */}
          <div className="flex flex-row md:flex-col gap-1 border-t md:border-t-0 md:border-l p-3 bg-slate-50/30 w-full md:w-40 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start text-xs text-slate-600 font-normal hover:bg-slate-100"
              onClick={selectLastMonth}
            >
              Last Month
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start text-xs text-slate-600 font-normal hover:bg-slate-100"
              onClick={selectLast3Months}
            >
              Last 3 Months
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start text-xs text-slate-600 font-normal hover:bg-slate-100"
              onClick={selectAllTime}
            >
              All Time
            </Button>
            <div className="px-2 py-1.5 text-xs text-blue-600 bg-blue-50/50 rounded-md font-medium mt-auto">
              Custom Range
            </div>
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="flex justify-end gap-2 border-t px-4 py-3 bg-slate-50/50">
          <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            disabled={!tempRange?.from || !tempRange?.to}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}