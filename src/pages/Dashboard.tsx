import { useStats } from '@/hooks/useStats';
import { useCategoryBreakdown } from '@/hooks/useCategoryBreakdown';
import { useBalanceHistory } from '@/hooks/useBalanceHistory';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';

/** One metric card — the four repeated cards collapse into this. */
function SummaryCard({ title, value, className }: { title: string; value: string; className?: string }) {
  return (
    <Card className="shadow-sm border">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className={`text-2xl font-bold ${className}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  // All three data sources ask the DATABASE — zero filter/reduce in this file.
  const { total_income, total_expense, net_balance, transaction_count, loading: statsLoading, error: statsError } = useStats();
  const { data: breakdown, loading: breakdownLoading } = useCategoryBreakdown();
  const { data: history, loading: historyLoading, error: historyError } = useBalanceHistory();

  const error = statsError ?? historyError;
  if (error) {
    return (
      <div className="p-6 text-sm text-rose-500">
        Couldn't load the dashboard: {error}. Is the backend running (npm run dev in /server)?
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards — totals computed in SQL (v_daily_stats) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Income"
          value={statsLoading ? '…' : formatCurrency(total_income)}
          className="text-blue-600"
        />
        <SummaryCard
          title="Expenses"
          value={statsLoading ? '…' : formatCurrency(total_expense)}
          className="text-rose-500"
        />
        <SummaryCard
          title="Balance"
          value={statsLoading ? '…' : formatCurrency(net_balance)}
          className="text-emerald-600"
        />
        <SummaryCard
          title="Transactions"
          value={statsLoading ? '…' : transaction_count.toLocaleString()}
          className="text-slate-700"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Doughnut: expense share per category */}
        <Card className="lg:col-span-2 shadow-sm border">
          <CardHeader className="border-b">
            <CardTitle className="text-base font-semibold text-slate-800">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {breakdown.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-slate-400 text-sm">
                {breakdownLoading ? 'Loading…' : 'No expense data within this date range.'}
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="w-full md:w-1/2 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={breakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {breakdown.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full md:w-1/2 space-y-2 max-h-64 overflow-y-auto pr-2">
                  {breakdown.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm py-1.5 border-b border-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
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

        {/* Area chart: running balance, computed by a window function in SQL */}
        <Card className="shadow-sm border">
          <CardHeader className="border-b">
            <CardTitle className="text-base font-semibold text-slate-800">Account - Balance</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {history.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-slate-400 text-sm">
                {historyLoading ? 'Loading…' : 'No history data within this date range.'}
              </div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      stroke="#cbd5e1"
                      tickFormatter={(value) => `$${value}`}
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