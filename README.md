Local-First Expense Tracker:

A modern, serverless personal finance application built to help users track, analyze, and manage their income and expenses with absolute privacy. Every transaction, custom filter, and profile modification is saved and processed directly on the client's machine, ensuring instantaneous loading speeds and complete data privacy.

Key Features:
Dynamic Financial Dashboard: Features aggregated metric cards detailing Net Balance, Total Income, Total Expenses, and transaction volume. Integrates responsive Recharts visualizations including a categorical expenditure doughnut chart (with custom legends) and a chronological account balance timeline.
Interactive Date Selector: Acts as a master date filter across the entire application. Features side-by-side calendars and quick-preset shortcuts. Adjusting this date instantly recalculates both your dashboard metrics and your transaction ledger rows.
Advanced Transaction Ledger: Displays transaction rows with color-coded feedback (emerald for income, rose for expenses). Supports instant text queries, pagination, and multi-select rows for bulk deletions.
Flexible Side-Panel Filters: Drill down into your finances by searching description queries, sorting categories, payment modes, cashflow types, or custom price ranges.
Dual-Mode Transaction Dialog: Uses a single form dialog component to handle both creating new entries and editing existing ones, keeping the UI codebase highly modular and maintainable].
Serverless Local Persistence: Uses a custom useLocalStorage React hook with serialized and deserialized type-safeguards to persist transaction logs and your custom user profile. State modifications trigger global window events to keep all components synced in real-time.

Tech Stack
Frontend Library: React 18
Language: TypeScript (configured with strict compilation rules)
Styling & Components: Tailwind CSS, Shadcn UI, Radix UI Primitives, Lucide Icons
Forms & Validation: React Hook Form, Zod Schema Validation
Charts: Recharts
State Management: Custom React Context (for global date filters) & Custom hooks (for state persistence)
