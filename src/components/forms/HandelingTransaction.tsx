import { TransactionForm } from '@/components/ui/forms/TransactionForm';
import { TransactionFormData, Transaction } from '@/types/transaction';

type EditPageProps = {
  existingTransaction: Transaction;
};

export default function EditTransactionPage({ existingTransaction }: EditPageProps) {
  const { id, ...formDefaults } = existingTransaction;

  function handleFormSubmit(data: TransactionFormData) {
    const updated: Transaction = {
      ...data,
      id, // ← use the extracted id here instead of existingTransaction.id
    };
    console.log(updated);
  }

  return (
    <TransactionForm
      onSubmit={handleFormSubmit}
      defaultValues={formDefaults}
    />
  );
}