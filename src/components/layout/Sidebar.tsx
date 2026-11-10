import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ReceiptText, Info, Wallet, Edit2,
  type LucideIcon,
} from 'lucide-react';
import { useStats } from '@/hooks/useStats';
import { usePersistentState } from '@/hooks/usePersistentState';
import { formatCurrency } from '@/lib/utils';
import { ProfileDialog } from './ProfileDialog';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200';

/** One nav link — the repeated className logic lives in exactly one place now. */
function NavItem({ to, icon: Icon, label }: { to: string; icon: LucideIcon; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
        }`
      }
    >
      <Icon className="h-5 w-5" />
      {label}
    </NavLink>
  );
}

export function Sidebar() {
  const [profileName, setProfileName] = usePersistentState('profile-name', 'Kenza Sanaa');
  const [profilePic, setProfilePic] = usePersistentState('profile-pic', DEFAULT_AVATAR);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { total_income: totalIncome } = useStats();

  const handleSaveProfile = (name: string, pic: string) => {
    setProfileName(name);
    setProfilePic(pic);
    setIsProfileOpen(false);
  };

  return (
    <div className="flex h-full flex-col px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-2 pb-8">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Wallet className="h-6 w-6" />
        </div>
        <span className="text-lg font-bold tracking-tight text-slate-900">
          EXPENSE TRACKER
        </span>
      </div>

      {/* Profile Card */}
      <div
        onClick={() => setIsProfileOpen(true)}
        className="group relative flex items-center gap-4 p-4 mb-6 rounded-2xl border border-slate-100 bg-white shadow-sm cursor-pointer hover:bg-slate-50 transition-all duration-200"
      >
        <div className="relative h-14 w-14 shrink-0 rounded-full overflow-hidden border border-slate-100">
          <img src={profilePic} alt="Profile Avatar" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
            <Edit2 className="h-4 w-4 text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">
            {profileName}
          </h2>
          <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-xs font-semibold">
            <Wallet className="h-3.5 w-3.5 text-slate-400" />
            <span>{formatCurrency(totalIncome)}</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
        <NavItem to="/transactions" icon={ReceiptText} label="Transactions" />
        <NavItem to="/about" icon={Info} label="About" />
      </nav>

      <ProfileDialog
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        initialName={profileName}
        initialPic={profilePic}
        onSave={handleSaveProfile}
      />
      <p className="text-xs text-slate-400">Expense Tracker by kenza</p>
    </div>
  );
}