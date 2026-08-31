import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { transactionFormSchema, TransactionFormData, CATEGORIES } from '@/types/transaction';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    <Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    
    {/* AMOUNT FIELD */}
    <FormField
      control={form.control}
      name="amount"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Amount</FormLabel>
          <FormControl>
            <Input 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              {...field} 
              value={field.value as number ?? ''}
            />
          </FormControl>
          <FormMessage /> {/* Auto-shows "Amount must be greater than 0" */}
        </FormItem>
      )}
    />

    {/* CATEGORY FIELD */}
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Add Transaction</Button>
  </form>
</Form>
  );
}