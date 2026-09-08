import { useState, useMemo, ChangeEvent } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, Info, Wallet, Camera, Edit2 } from 'lucide-react';

import { useLocalStorage } from '@/hook/useLocalStorage';
import { useTransactions } from '@/hooks/useTransactions';
import { formatCurrency } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Standard fallback avatar (Unsplash portrait matching your design style)
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200';

export function Sidebar() {
  const { transactions } = useTransactions();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // 1. Persistent LocalStorage state for User Profile
  const [profileName, setProfileName] = useLocalStorage('profile-name', 'Kenza Sanaa');
  const [profilePic, setProfilePic] = useLocalStorage('profile-pic', DEFAULT_AVATAR);

  // Temporary dialog input states
  const [tempName, setTempName] = useState(profileName);
  const [tempPic, setTempPic] = useState(profilePic);

  // 2. Dynamic Income Calculation (updates instantly when income is added/deleted)
  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  // Handle uploading and converting a file to a Base64 string
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempPic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    setProfileName(tempName);
    setProfilePic(tempPic);
    setIsProfileOpen(false);
  };

  const handleOpenDialog = () => {
    setTempName(profileName);
    setTempPic(profilePic);
    setIsProfileOpen(true);
  };

  return (
    <div className="flex h-full flex-col px-4 py-6">
      
      {/* Header App Title */}
      <div className="flex items-center gap-3 px-2 pb-8">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
          <Wallet className="h-6 w-6" />
        </div>
       <span className="text-lg font-bold tracking-tight text-slate-900"> EXPENSE TRACKER </span>
      </div>

      {/* 
        PROFILE CARD:
        Clicking this opens the custom Edit Profile modal
      */}
      <div 
        onClick={handleOpenDialog}
        className="group relative flex items-center gap-4 p-4 mb-6 rounded-2xl border border-slate-100 bg-white shadow-sm cursor-pointer hover:bg-slate-50 transition-all duration-200"
      >
        <div className="relative h-14 w-14 shrink-0 rounded-full overflow-hidden border border-slate-100">
          <img 
            src={profilePic} 
            alt="Profile Avatar" 
            className="h-full w-full object-cover" 
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
            <Edit2 className="h-4 w-4 text-white" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-slate-800 text-sm truncate group-hover:text-blue-600 transition-colors">
            {profileName}
          </h2>
          {/* Dynamic Income value */}
          <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-xs font-semibold">
            <Wallet className="h-3.5 w-3.5 text-slate-400" />
            <span>{formatCurrency(totalIncome)}</span>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 space-y-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
            }`
          }
        >
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </NavLink>

        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
            }`
          }
        >
          <ReceiptText className="h-5 w-5" />
          Transactions
        </NavLink>

        <NavLink
          to="/about"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
            }`
          }
        >
          <Info className="h-5 w-5" />
          About
        </NavLink>
      </nav>

      {/* 
        EDIT PROFILE DIALOG 
        Allows editing name and picture with full LocalStorage persistence
      */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            
            {/* Avatar Preview & Upload Action */}
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="relative h-24 w-24 rounded-full overflow-hidden border shadow-sm">
                <img 
                  src={tempPic} 
                  alt="Temp Avatar Preview" 
                  className="h-full w-full object-cover" 
                />
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition-all">
                  <Camera className="h-6 w-6 text-white" />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange} 
                  />
                </label>
              </div>
              <span className="text-xs text-slate-400 font-medium">Click image to upload photo</span>
            </div>

            {/* Profile Name Input */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold text-slate-600">
                Profile Name
              </Label>
              <Input
                id="name"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsProfileOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveProfile} disabled={!tempName.trim()}>
                Save Profile
              </Button>
            </div>

          </div>
        </DialogContent>
      </Dialog>
      <p className=" text-xs text-slate-400">Expense Tracker by kenza</p>
    </div>
  );
}