import { useState, useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useDateRange } from '@/hooks/useDateRange';
import { AddTransactionDialog } from '@/components/transaction/AddTransactionDialog';
import { CATEGORIES, PAYMENT_MODES, FilterState } from '@/types/transaction';
import { formatCurrency } from '@/lib/utils';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Trash2, Edit } from 'lucide-react';

export default function Transactions() {
  const { transactions, deleteTransaction } = useTransactions();
  const { dateRange } = useDateRange();

  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Controlled Edit States
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter States
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categories: [],
    types: ['income', 'expense'],
    paymentModes: [],
    minAmount: undefined,
    maxAmount: undefined,
  });

  // Dynamic Filtering Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Date Filter
      const txDate = new Date(t.date);
      if (dateRange.from && txDate < dateRange.from) return false;
      if (dateRange.to && txDate > dateRange.to) return false;

      // Text Search
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesDesc = t.description.toLowerCase().includes(query);
        const matchesCat = t.category.toLowerCase().includes(query);
        if (!matchesDesc && !matchesCat) return false;
      }

      // Cashflow Type (Income/Expense)
      if (filters.types.length > 0 && !filters.types.includes(t.type)) return false;

      // Selected Categories
      if (filters.categories.length > 0 && !filters.categories.includes(t.category)) return false;

      // Selected Payment Modes
      if (filters.paymentModes.length > 0 && !filters.paymentModes.includes(t.paymentMode)) return false;

      // Min/Max Amounts
      if (filters.minAmount !== undefined && t.amount < filters.minAmount) return false;
      if (filters.maxAmount !== undefined && t.amount > filters.maxAmount) return false;

      return true;
    });
  }, [transactions, filters, dateRange]);

  // Checkbox Selection Helpers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredTransactions.map((t) => t.id).filter((id): id is string => !!id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Trigger editing modal (enabled when exactly 1 item is selected)
  const handleEditClick = () => {
    if (selectedIds.length === 1) {
      setEditingId(selectedIds[0]);
      setIsEditDialogOpen(true);
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} transaction(s)?`)) {
      selectedIds.forEach((id) => deleteTransaction(id));
      setSelectedIds([]);
    }
  };

  const toggleArrayFilter = <K extends keyof FilterState>(
    key: K,
    value: string
  ) => {
    setFilters((prev) => {
      const currentArr = (prev[key] as string[]) || [];
      const updatedArr = currentArr.includes(value)
        ? currentArr.filter((item) => item !== value)
        : [...currentArr, value];
      return { ...prev, [key]: updatedArr };
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full items-start">
      
      {/* LEFT CONTENT AREA */}
      <div className="flex-1 w-full space-y-4">
        
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
          <div className="relative w-full sm:w-72">
            <Input
              placeholder="Search description or category..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 items-center w-full sm:w-auto justify-end">
            {selectedIds.length > 0 && (
              <div className="flex gap-2 mr-2">
                {/* 
                  Edit button is enabled only when exactly one item is checked.
                  It triggers handleEditClick.
                */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  disabled={selectedIds.length !== 1}
                  onClick={handleEditClick}
                >
                  <Edit className="h-4 w-4" />
                  Edit ({selectedIds.length})
                </Button>
                <Button variant="destructive" size="sm" className="gap-1" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4" />
                  Delete ({selectedIds.length})
                </Button>
              </div>
            )}
            
            {/* Create mode dialog (uncontrolled trigger) */}
            <AddTransactionDialog />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      filteredTransactions.length > 0 &&
                      selectedIds.length === filteredTransactions.length
                    }
                    onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  />
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-36 text-center text-slate-400">
                    No transactions found matches your active filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(tx.id || '')}
                        onCheckedChange={(checked) => handleSelectRow(tx.id || '', !!checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">{tx.category}</TableCell>
                    <TableCell className="text-slate-500">
                      {tx.date instanceof Date 
                        ? tx.date.toLocaleDateString() 
                        : new Date(tx.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-slate-500">{tx.paymentMode}</TableCell>
                    <TableCell className="text-slate-600 max-w-xs truncate">{tx.description}</TableCell>
                    <TableCell className={`text-right font-semibold ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-rose-500'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* RIGHT SIDE FILTER PANEL */}
      <aside className="w-full lg:w-80 bg-white rounded-xl border shadow-sm p-5 space-y-6 shrink-0 lg:sticky lg:top-4">
        <h3 className="text-sm font-semibold text-slate-900 pb-2 border-b">Filters</h3>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500">Cashflow</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <Checkbox
                checked={filters.types.includes('income')}
                onCheckedChange={() => toggleArrayFilter('types', 'income')}
              />
              Income
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <Checkbox
                checked={filters.types.includes('expense')}
                onCheckedChange={() => toggleArrayFilter('types', 'expense')}
              />
              Expense
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500">Categories</label>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
            {CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <Checkbox
                  checked={filters.categories.includes(cat)}
                  onCheckedChange={() => toggleArrayFilter('categories', cat)}
                />
                {cat}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500">Payment Modes</label>
          <div className="space-y-2">
            {PAYMENT_MODES.map((mode) => (
              <label key={mode} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <Checkbox
                  checked={filters.paymentModes.includes(mode)}
                  onCheckedChange={() => toggleArrayFilter('paymentModes', mode)}
                />
                {mode}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500 font-medium">Amount Range</label>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minAmount ?? ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  minAmount: e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
            />
            <span className="text-slate-400 text-sm">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxAmount ?? ''}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  maxAmount: e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
            />
          </div>
        </div>
      </aside>

      {/* 
        This is the controlled edit dialog. 
        It renders with no trigger, opening programmatically when editingId is set.
      */}
      {editingId && (
        <AddTransactionDialog
          transactionId={editingId}
          open={isEditDialogOpen}
          onOpenChange={(isOpen) => {
            setIsEditDialogOpen(isOpen);
            if (!isOpen) setEditingId(null);
          }}
        />
      )}
    </div>
  );
}