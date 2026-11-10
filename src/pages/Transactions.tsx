import { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useLookups } from '@/hooks/useLookups';
import { AddTransactionDialog } from '@/components/transaction/AddTransactionDialog';
import type { FilterState } from '@/types/transaction';
import { formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Trash2, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;

export default function Transactions() {
  // UI filter state (names, not ids — ids are resolved in the hook)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categories: [],
    types: ['income', 'expense'],
    paymentModes: [],
    minAmount: undefined,
    maxAmount: undefined,
  });
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { categories, paymentModes } = useLookups();

  // THE MIGRATION: no filtering happens in this file anymore.
  // These are query parameters — PostgreSQL applies them and paginates.
  const { transactions, total, loading, deleteTransactions } = useTransactions({
    page,
    pageSize: PAGE_SIZE,
    types: filters.types,
    categories: filters.categories,
    paymentModes: filters.paymentModes,
    search: filters.search || undefined,
    min: filters.minAmount?.toString(),
    max: filters.maxAmount?.toString(),
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Any filter change invalidates the current page AND the current selection
  const patchFilters = (patch: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
    setSelectedIds([]);
  };

  const goToPage = (p: number) => {
    setPage(p);
    setSelectedIds([]);
  };

const toggleArrayFilter = (key: 'categories' | 'types' | 'paymentModes', value: string) => {
  const arr = filters[key] as string[];
  patchFilters({
    [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
  } as Partial<FilterState>);
};
  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} transaction(s)?`)) return;
    await deleteTransactions(selectedIds);   // ONE request, not N
    setSelectedIds([]);
  };

  const allSelected = transactions.length > 0 && selectedIds.length === transactions.length;
  const handleSelectAll = (checked: boolean) =>
    setSelectedIds(checked ? transactions.map((t) => t.id) : []);
  const handleSelectRow = (id: string, checked: boolean) =>
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full items-start">
      {/* LEFT: toolbar + table + pagination */}
      <div className="flex-1 w-full space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
          <div className="relative w-full sm:w-72">
            <Input
              placeholder="Search description or category..."
              value={filters.search}
              onChange={(e) => patchFilters({ search: e.target.value })}
            />
          </div>

          <div className="flex gap-2 items-center w-full sm:w-auto justify-end">
            {selectedIds.length > 0 && (
              <div className="flex gap-2 mr-2">
                <Button
                  variant="outline" size="sm" className="gap-1"
                  disabled={selectedIds.length !== 1}
                  onClick={() => setEditingId(selectedIds[0])}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
                <Button variant="destructive" size="sm" className="gap-1" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4" />
                  Delete ({selectedIds.length})
                </Button>
              </div>
            )}
            <AddTransactionDialog />
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox checked={allSelected} onCheckedChange={(c) => handleSelectAll(!!c)} />
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-36 text-center text-slate-400">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-36 text-center text-slate-400">
                    No transactions match your active filters.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(tx.id)}
                        onCheckedChange={(c) => handleSelectRow(tx.id, !!c)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">{tx.category}</TableCell>
                    <TableCell className="text-slate-500">{tx.date.toLocaleDateString()}</TableCell>
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

        {/* Server-side pagination — the DB counts, the UI just navigates */}
        <div className="flex items-center justify-between bg-white p-3 rounded-xl border shadow-sm text-sm text-slate-500">
          <span>{total} transaction(s) · page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* RIGHT: filter panel — options now come from the DB via useLookups */}
      <aside className="w-full lg:w-80 bg-white rounded-xl border shadow-sm p-5 space-y-6 shrink-0 lg:sticky lg:top-4">
        <h3 className="text-sm font-semibold text-slate-900 pb-2 border-b">Filters</h3>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500">Cashflow</label>
          <div className="flex gap-4">
            {(['income', 'expense'] as const).map((t) => (
              <label key={t} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <Checkbox
                  checked={filters.types.includes(t)}
                  onCheckedChange={() => toggleArrayFilter('types', t)}
                />
                {t[0].toUpperCase() + t.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500">Categories</label>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <Checkbox
                  checked={filters.categories.includes(c.name)}
                  onCheckedChange={() => toggleArrayFilter('categories', c.name)}
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500">Payment Modes</label>
          <div className="space-y-2">
            {paymentModes.map((m) => (
              <label key={m.id} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <Checkbox
                  checked={filters.paymentModes.includes(m.name)}
                  onCheckedChange={() => toggleArrayFilter('paymentModes', m.name)}
                />
                {m.name}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-500">Amount Range</label>
          <div className="flex gap-2 items-center">
            <Input
              type="number" placeholder="Min"
              value={filters.minAmount ?? ''}
              onChange={(e) =>
                patchFilters({ minAmount: e.target.value === '' ? undefined : Number(e.target.value) })
              }
            />
            <span className="text-slate-400 text-sm">-</span>
            <Input
              type="number" placeholder="Max"
              value={filters.maxAmount ?? ''}
              onChange={(e) =>
                patchFilters({ maxAmount: e.target.value === '' ? undefined : Number(e.target.value) })
              }
            />
          </div>
        </div>
      </aside>

      {/* Controlled edit dialog (opens when exactly one row is selected) */}
      {editingId && (
        <AddTransactionDialog
          transactionId={editingId}
          open={true}
          onOpenChange={(isOpen) => { if (!isOpen) setEditingId(null); }}
        />
      )}
    </div>
  );
}