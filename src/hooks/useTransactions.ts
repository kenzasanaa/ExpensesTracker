import { useLocalStorage } from '@/hook/useLocalStorage'
import { Transaction } from '@/types/transaction'

const STORAGE_KEY = 'expenses-tracker-transactions'

const getInitialTransactions = (): Transaction[] => [
  {
    id: 'demo-1',
    type: 'income',
    amount: 4000,
    category: 'Extra Income',
    date: new Date('2017-06-01'),
    paymentMode: 'Debit Card',
    description: 'Income from Salary',
  },
  {
    id: 'demo-2',
    type: 'expense',
    amount: 45,
    category: 'Food',
    date: new Date('2017-06-02'),
    paymentMode: 'Cash',
    description: 'Groceries',
  },
]

export function useTransactions() {
  const [transactions, setTransactions, removeTransactions] = useLocalStorage<Transaction[]>(
    STORAGE_KEY,
    getInitialTransactions,
    {
      // Replace (t: any) with this:
      deserializer: (value) => {
        type SerializedTransaction = Omit<Transaction, 'date'> & { date: string }
        const parsed = JSON.parse(value) as SerializedTransaction[]
        return parsed.map((t) => ({
          ...t,
          date: new Date(t.date),
        }))
      },
    }
  )

  const addTransaction = (transaction: Transaction) => {
    setTransactions((prev) => [...prev, transaction])
  }

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    )
  }

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    removeTransactions,
  }
}