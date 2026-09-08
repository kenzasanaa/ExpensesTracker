import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';

import { useTransactions } from '@/hooks/useTransactions';
import { 
  transactionFormSchema, 
  TransactionFormData, 
  CATEGORIES, 
  PAYMENT_MODES 
} from '@/types/transaction';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddTransactionDialogProps {
  transactionId?: string; // If provided, the form acts in EDIT mode
  open?: boolean;         // Controlled open state from parent
  onOpenChange?: (open: boolean) => void;
}

export function AddTransactionDialog({ 
  transactionId, 
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange 
}: AddTransactionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Support both uncontrolled (Add button) and controlled (Edit button) states
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled && controlledOnOpenChange ? controlledOnOpenChange : setInternalOpen;

  const { transactions, addTransaction, updateTransaction } = useTransactions();

  // Find the transaction data if we are editing
  const transactionToEdit = transactions.find((t) => t.id === transactionId);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: 'expense',
      amount: undefined,
      category: 'Food',
      date: new Date(),
      time: '',
      description: '',
      paymentMode: 'Cash',
    },
  });

  // Automatically pre-populate the form when editing, or reset it when adding
  useEffect(() => {
    if (open) {
      if (transactionToEdit) {
        form.reset({
          type: transactionToEdit.type,
          amount: transactionToEdit.amount,
          category: transactionToEdit.category,
          date: new Date(transactionToEdit.date),
          time: transactionToEdit.time || '',
          description: transactionToEdit.description,
          paymentMode: transactionToEdit.paymentMode,
        });
      } else {
        form.reset({
          type: 'expense',
          amount: undefined,
          category: 'Food',
          date: new Date(),
          time: '',
          description: '',
          paymentMode: 'Cash',
        });
      }
    }
  }, [open, transactionToEdit, form]);

  const onSubmit = (data: TransactionFormData) => {
    try {
      if (transactionId) {
        // Edit Mode: update the existing item in local storage
        updateTransaction(transactionId, data);
      } else {
        // Add Mode: insert a new item
        addTransaction(data);
      }
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) form.reset(); }}>
      
     {/* Show the standard trigger only if we are NOT in controlled edit mode */}
  {!isControlled && (
    <Button size="sm" className="gap-1 cursor-pointer" onClick={() => setOpen(true)}>
      <Plus className="h-4 w-4" />
      Add Transaction
    </Button>
  )}
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{transactionId ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            
            {/* Type Toggle Buttons (Expense / Income) */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="grid grid-cols-2 gap-2 space-y-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => field.onChange('expense')}
                    className={field.value === 'expense' ? 'bg-rose-50 border-rose-500 text-rose-600 hover:bg-rose-50 hover:text-rose-600' : ''}
                  >
                    Expense
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => field.onChange('income')}
                    className={field.value === 'income' ? 'bg-blue-50 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-600' : ''}
                  >
                    Income
                  </Button>
                </FormItem>
              )}
            />

            {/* Amount */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time (Optional)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Payment Mode */}
            <FormField
              control={form.control}
              name="paymentMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Mode</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a payment mode" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_MODES.map((mode) => (
                        <SelectItem key={mode} value={mode}>{mode}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Weekly grocery shopping" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { form.reset(); setOpen(false); }}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Transaction'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}