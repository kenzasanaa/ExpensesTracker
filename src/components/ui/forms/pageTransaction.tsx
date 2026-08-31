import { TransactionForm } from '@/components/ui/forms/TransactionForm';
import { TransactionFormData, Transaction } from '@/types/transaction';

export default function AddTransactionPage() {
  function handleFormSubmit(data: TransactionFormData) {
    const newTransaction: Transaction = {
      ...data,
      id: crypto.randomUUID(),
    };
    console.log(newTransaction);
  }

  return <TransactionForm onSubmit={handleFormSubmit} />;
}