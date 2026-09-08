import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from './DateRangePicker'; // Adjust path if needed

interface HeaderProps {
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'All Transactions',
};

export function Header({ onMenuClick }: HeaderProps) {
  const location = useLocation();
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

      {/* Renders the interactive popover calendar picker */}
      <DateRangePicker />
    </header>
  );
}