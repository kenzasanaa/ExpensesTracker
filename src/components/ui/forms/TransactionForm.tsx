import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionFormSchema, TransactionFormData } from '@/types/transaction';

// 1. Add types for the props
type TransactionFormProps = {
  onSubmit: (data: TransactionFormData) => void;
  defaultValues?: Partial<TransactionFormData>;
};

export function TransactionForm({ onSubmit, defaultValues }: TransactionFormProps) {
   const form = useForm<z.input<typeof transactionFormSchema>, unknown, TransactionFormData>({
    resolver: zodResolver(transactionFormSchema) ,
    defaultValues: defaultValues || {
      type: 'expense',
      amount: 0,
      date: new Date(),
      time: '12:00',
      description: '',
      paymentMode: 'Cash',
    },
  });

  // 2. Actually use `form` and `onSubmit`
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Example input */}
      <input {...form.register('description')} placeholder="Description" />
      
      {form.formState.errors.description && (
        <p>{form.formState.errors.description.message}</p>
      )}
      
      <button type="submit">Save</button>
    </form>
  );
}