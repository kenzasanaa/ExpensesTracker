import { useLocation } from 'react-router-dom';
import { Menu, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useDateRange } from '@/hooks/useDateRange';

interface HeaderProps {
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'All Transactions',
};

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
  const { dateRange } = useDateRange();

  const title = pageTitles[location.pathname] || 'Expense Tracker';

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>

      <Button variant="outline" className="gap-2 text-sm font-normal h-9">
        <Calendar className="h-4 w-4 text-slate-500" />
        <span className="hidden sm:inline text-slate-600">
          {format(dateRange.from, 'MM/dd/yyyy')} - {format(dateRange.to, 'MM/dd/yyyy')}
        </span>
        <span className="sm:hidden text-slate-600">
          {format(dateRange.from, 'MM/dd')} - {format(dateRange.to, 'MM/dd')}
        </span>
      </Button>
    </header>
  );
}