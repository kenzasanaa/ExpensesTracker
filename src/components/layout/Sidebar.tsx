import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Info, Wallet, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: Receipt },
  { path: '/about', label: 'About', icon: Info },
];

export function Sidebar() {
  return (
    <div className="flex h-full flex-col bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6">
       
        <Wallet className="h-6 w-6 text-blue-600" />
        <span className="text-lg font-bold tracking-tight text-slate-900">
          EXPENSE TRACKER
        </span>
      </div>

      <Separator />

      {/* User Profile Card */}
      <div className="px-4 py-4">
        <Card className="shadow-none">
          <CardContent className="flex items-center gap-3 p-4">
            <Avatar className="h-12 w-12 border">
              <AvatarImage src="https://i.pravatar.cc/150?u=nicholas" alt="kenza" />
              <AvatarFallback className="bg-blue-50 text-blue-700">ND</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">
                Kenza Sanaa
              </span>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Banknote className="h-3.5 w-3.5" />
                <span>$5,240</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4">
        <Separator className="mb-4" />
        <p className="text-xs text-slate-400">Expense Tracker v1.0</p>
      </div>
    </div>
  );
}