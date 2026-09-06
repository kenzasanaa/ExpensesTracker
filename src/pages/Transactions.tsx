import { AddTransactionDialog } from '@/components/transaction/AddTransactionDialog';

export default function Transactions() {
  return (
    <div className="rounded-xl bg-white shadow-sm border">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-lg font-semibold text-slate-900">Transaction List</h2>
        {/* Render the modal component */}
        <AddTransactionDialog />
      </div>
      <div className="p-12 text-center text-slate-400">
        Data table will go here (Phase 6)
      </div>
    </div>
  );
}