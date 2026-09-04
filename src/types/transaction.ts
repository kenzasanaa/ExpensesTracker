import { z } from 'zod';

// 1. Define reusable constants
export const CATEGORIES = [
  'Rent',
  'Food',
  'Transportation',
  'Grocories',
  'Bills',
  'Clothing',
  'Shopping',
  'Education',
  'Extra Income',
  'Others',
] as const;

export const PAYMENT_MODES = ['Cash','Credit Card', 'Debit Card' ,'Bank Transfer'] as const;

// 2. Build the Zod schema FIRST
export const transactionSchema = z.object({
  id: z.string().optional(), // Only present when editing

  type: z.enum(['income', 'expense'], {
    message: 'Please select a transaction type',
  }),

  amount: z.coerce
    .number({ message: 'Amount must be a number' })
    .positive('Amount must be greater than 0')
    .max(999999, 'Amount is unrealistically high'),

  category: z.enum(CATEGORIES, {
    message: 'Please select a category',
  }),

  date: z.coerce.date({
    message: 'Please select a valid date',
  }),

  time: z.string().optional(), // Keep as string "14:30" for the input

  description: z
    .string()
    .min(2, 'Description must be at least 2 characters')
    .max(100, 'Description is too long'),

  paymentMode: z.enum(PAYMENT_MODES, {
    message: 'Please select a payment mode',
  }),
});

// 3. Derive the TypeScript type automatically
export type Transaction = z.infer<typeof transactionSchema>;

// 4. NOW derive the form schema (after transactionSchema is declared)
//export const transactionFormSchema = transactionSchema.omit({ id: true });
export const transactionFormSchema = transactionSchema
  .omit({ id: true })
  .refine(
    (data) => {
      if (data.category === 'Extra Income' && data.type !== 'income') {
        return false;
      }
      return true;
    },
    {
      message: 'Extra Income can only be an Income transaction',
      path: ['category'],
    }
  );
export type TransactionFormData = z.infer<typeof transactionFormSchema>;