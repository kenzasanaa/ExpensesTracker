import { Transaction } from '@/types/transaction';
import { addDays, startOfDay } from 'date-fns';

// Only categories that exist in your Transaction type
const EXPENSE_CATEGORIES = [
  'Food',
  'Transportation',
  'Grocories',
  'Clothing',
  'Shopping',
  'Education',
  'Others',
] as const;

const DESCRIPTIONS: Record<string, string[]> = {
  'Food': ['Palmetto Cheese', 'Muffuletta sandwich', 'Groceries', 'Restaurant', 'Mint julep'],
  'Transportation': ['Other vehicle expenses', 'Gas', 'Car maintenance', 'Uber ride'],
  'Groceries': ['Weekly groceries', 'Supermarket run', 'Fresh produce'],
  'Clothing': ['Pair of Running Shoes', 'Winter jacket', 'T-shirt'],
  'Shopping': ['Beauty care things', 'Running Shoes', 'General shopping'],
  'Education': ['Online course', 'Books', 'Workshop fee'],
  'Others': ['Miscellaneous', 'Gift', 'Charity donation'],
};

const PAYMENT_MODES = ['Cash', 'Debit Card', 'Credit Card'] as const;

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateMockTransactions(count: number = 350): Transaction[] {
  const transactions: Transaction[] = [];
  const startDate = new Date(2017, 5, 1); // June 1, 2017
  const endDate = new Date(2017, 10, 30); // Nov 30, 2017

  // Fixed income entries (salary twice a month)
  const incomeDates = [
    new Date('2017-06-01'), new Date('2017-06-15'),
    new Date('2017-07-01'), new Date('2017-07-15'),
    new Date('2017-08-01'), new Date('2017-08-15'),
    new Date('2017-09-01'), new Date('2017-09-15'),
    new Date('2017-10-01'), new Date('2017-10-15'),
    new Date('2017-11-01'), new Date('2017-11-15'),
  ];

  incomeDates.forEach((date, i) => {
    transactions.push({
      id: `inc-${i}`,
      type: 'income',
      amount: randomInt(3500, 4200),
      category: 'Extra Income',
      date,                          // Date object ✓
      paymentMode: randomItem([...PAYMENT_MODES]),
      description: 'Income from Salary',
    });
  });

  // Random expenses
  for (let i = 0; i < count; i++) {
    const daysOffset = randomInt(0, 180);
    const date = addDays(startDate, daysOffset);
    if (date > endDate) continue;

    const category = randomItem(EXPENSE_CATEGORIES);
    const amount =
      category === 'Food' ? randomInt(5, 60) :
      category === 'Transportation' ? randomInt(5, 35) :
      randomInt(20, 300);

    transactions.push({
      id: `exp-${i}`,
      type: 'expense',
      amount,
      category,                      // Literal union type ✓
      date: startOfDay(date),       // Date object ✓
      paymentMode: randomItem([...PAYMENT_MODES]),
      description: randomItem(DESCRIPTIONS[category] || ['Expense']),
    });
  }

  return transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export const transactions = generateMockTransactions();