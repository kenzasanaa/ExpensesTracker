import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTransactions } from '@/hooks/useTransactions';
import { useDateRange } from '@/hooks/useDateRange';
import { formatCurrency } from '@/lib/utils';

export default function Dashboard() {
  // 1. Get real transactions from localStorage
  const { transactions } = useTransactions();

  // 2. Get the date range from the header (June 1 - Nov 30, 2017 by default)
  const { dateRange } = useDateRange();

  // 3. Compute metrics — only for transactions within the selected date range
  const { totalIncome, totalExpense, balance, count } = useMemo(() => {
    // Filter transactions that fall within the selected date range
    const filtered = transactions.filter((t) => {
      const txDate = new Date(t.date);
      return txDate >= dateRange.from && txDate <= dateRange.to;
    });

    const totalIncome = filtered
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = filtered
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      count: filtered.length,
    };
  }, [transactions, dateRange]);

  return (
    <div className="space-y-6">
      {/* Summary Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Income */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalIncome)}
            </p>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-rose-500">
              {formatCurrency(totalExpense)}
            </p>
          </CardContent>
        </Card>

        {/* Balance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(balance)}
            </p>
          </CardContent>
        </Card>

        {/* Transaction Count */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-700">
              {count.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center text-slate-400">
            Donut chart will go here (Phase 5)
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Balance</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center text-slate-400">
            Line chart will go here (Phase 5)
          </CardContent>
        </Card>
      </div>
    </div>
  );
}