import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wallet, 
  ShieldCheck, 
  LayoutDashboard, 
  ReceiptText, 
  CalendarRange, 
  Cpu 
} from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      
      {/* Hero Card */}
      <Card className="border shadow-sm overflow-hidden rounded-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="space-y-3 max-w-lg">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Expense Tracker</h1>
            <p className="text-blue-100 text-sm md:text-base leading-relaxed">
              A modern, serverless personal finance companion designed to help you track, analyze, and manage your income and expenses with absolute privacy.
            </p>
          </div>
          <div className="p-4 bg-white/10 rounded-2xl border border-white/20 shrink-0">
            <Wallet className="h-16 w-16 text-white" />
          </div>
        </div>
      </Card>

      {/* Core Design Philosophy */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2.5 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800">Local-First Storage</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 leading-relaxed">
            Your data never leaves your device. All transactions, profiles, and configurations are securely saved in your browser's local database. This provides instantaneous loading times and guarantees complete personal privacy.
          </CardContent>
        </Card>

        <Card className="border shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2.5 text-blue-600">
              <CalendarRange className="h-5 w-5" />
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-800">Unified Date Window</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 leading-relaxed">
            The application operates under a unified date range filter. Selecting a range via the top bar instantly updates both your dashboard financial metrics, expenditure donut charts, and transaction ledger rows.
          </CardContent>
        </Card>
      </div>

      {/* Application Features */}
      <Card className="border shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-800">Functional Capabilities</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          
          <div className="flex gap-4">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-slate-800">Interactive Dashboard</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Aggregated metrics detailing net balance alongside dynamic Recharts visualizations mapping spending categorization and timeline curves.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ReceiptText className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-slate-800">Advanced Transaction Ledger</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Filter by categories, payment modes, cashflow directions, and amounts. Includes search queries, multi-select operations, and instant CRUD capabilities.
              </p>
            </div>
          </div>

        </CardContent>
      </Card>

      {/* Technical Architecture */}
      <Card className="border shadow-sm rounded-xl">
        <CardHeader>
          <div className="flex items-center gap-2 text-slate-800">
            <Cpu className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base font-bold">Technological Stack</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-md border bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">React 18</span>
            <span className="rounded-md border bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">TypeScript</span>
            <span className="rounded-md border bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">Tailwind CSS v4</span>
            <span className="rounded-md border bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">Shadcn UI</span>
            <span className="rounded-md border bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">Radix UI Primitives</span>
            <span className="rounded-md border bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">Zod Validation</span>
            <span className="rounded-md border bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">React Hook Form</span>
            <span className="rounded-md border bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">Recharts</span>
          </div>
        </CardContent>
      </Card>

      {/* Footer Branding */}
      <div className="text-center text-xs text-slate-400 font-medium">
        Expense Tracker • Kenza Sanaa
      </div>

    </div>
  );
}