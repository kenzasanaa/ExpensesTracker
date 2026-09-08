import { useMemo } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { useDateRange } from '@/hooks/useDateRange';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

// Color map assigned to your categories to match the mockup designs
const CATEGORY_COLORS: Record<string, string> = {
  Rent: '#2dd4bf',           // Teal-like
  Food: '#eab308',           // Warm Yellow
  Transportation: '#3b82f6', // Indigo-blue
  Groceries: '#84cc16',      // Lime-green
  Bills: '#f97316',          // Warm Orange
  Clothing: '#a855f7',       // Purple
  Shopping: '#ec4899',       // Pink
  Education: '#06b6d4',       // Cyan
  Others: '#64748b',         // Slate Gray
};

export default function Dashboard() {
  const { transactions } = useTransactions();
  const { dateRange } = useDateRange();

  // 1. Core metric and chart data transformations
  const { 
    totalIncome, 
    totalExpense, 
    balance, 
    count, 
    expenseBreakdown, 
    balanceHistory 
  } = useMemo(() => {
    
    // Filter transactions that fall within the selected date range
    const filtered = transactions.filter((t) => {
      const txDate = new Date(t.date);
      return txDate >= dateRange.from && txDate <= dateRange.to;
    });

    // Sort chronologically for timeline tracking
    const sortedFiltered = [...filtered].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate core card summary values
    const incomeSum = filtered
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenseSum = filtered
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // ---- A. Total Expenses Category Breakdown (Doughnut Chart) ----
    const categoryTotals: Record<string, number> = {};
    filtered
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const breakdownData = Object.keys(categoryTotals).map((cat) => {
      const amount = categoryTotals[cat];
      const percentage = expenseSum > 0 ? (amount / expenseSum) * 100 : 0;
      return {
        name: cat,
        value: amount,
        percentage: Number(percentage.toFixed(2)),
        color: CATEGORY_COLORS[cat] || '#94a3b8',
      };
    }).sort((a, b) => b.value - a.value); // Order highest spending first

    // ---- B. Running Account Balance Over Time (Area Chart) ----
    let runningBalance = 0;
    const balanceTimeline: Record<string, number> = {};

    sortedFiltered.forEach((t) => {
      const dateStr = new Date(t.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      
      const change = t.type === 'income' ? t.amount : -t.amount;
      runningBalance += change;
      balanceTimeline[dateStr] = runningBalance;
    });

    const balanceHistoryData = Object.keys(balanceTimeline).map((date) => ({
      date,
      balance: balanceTimeline[date],
    }));

    return {
      totalIncome: incomeSum,
      totalExpense: expenseSum,
      balance: incomeSum - expenseSum,
      count: filtered.length,
      expenseBreakdown: breakdownData,
      balanceHistory: balanceHistoryData,
    };
  }, [transactions, dateRange]);

  return (
    <div className="space-y-6">
      
      {/* Summary Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Income */}
        <Card className="shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalIncome)}
            </p>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card className="shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-rose-500">
              {formatCurrency(totalExpense)}
            </p>
          </CardContent>
        </Card>

        {/* Balance */}
        <Card className="shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">
              {formatCurrency(balance)}
            </p>
          </CardContent>
        </Card>

        {/* Transaction Count */}
        <Card className="shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-slate-700">
              {count.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dynamic Visual Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Card: Total Expenses Doughnut & Legends */}
        <Card className="lg:col-span-2 shadow-sm border">
          <CardHeader className="border-b">
            <CardTitle className="text-base font-semibold text-slate-800">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {expenseBreakdown.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-slate-400 text-sm">
                No expense data within this date range.
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Responsive Doughnut Slice */}
                <div className="w-full md:w-1/2 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {expenseBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Custom Interactive Legend Table matching your mockup */}
                <div className="w-full md:w-1/2 space-y-2 max-h-64 overflow-y-auto pr-2">
                  {expenseBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-50">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full shrink-0" 
                          style={{ backgroundColor: item.color }} 
                        />
                        <span className="font-medium text-slate-700">{item.name}</span>
                      </div>
                      <div className="flex gap-4 text-slate-500 font-semibold">
                        <span>{formatCurrency(item.value)}</span>
                        <span className="w-12 text-right text-xs text-slate-400 font-medium">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Card: Balance Timeline Area Chart */}
        <Card className="shadow-sm border">
          <CardHeader className="border-b">
            <CardTitle className="text-base font-semibold text-slate-800">Account - Balance</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {balanceHistory.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-slate-400 text-sm">
                No history data within this date range.
              </div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={balanceHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      stroke="#cbd5e1" 
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: '#64748b' }} 
                      stroke="#cbd5e1" 
                      tickFormatter={(value) => `$${value}`} // Changed formatter to tickFormatter
                    />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorBalance)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}