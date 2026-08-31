import { TransactionForm } from '@/components/ui/forms/TransactionForm';
import { Transaction, TransactionFormData } from '@/types/transaction';

type EditPageProps = {
  existingTransaction: Transaction;
};

export default function EditTransactionPage({ existingTransaction }: EditPageProps) {
  function handleFormSubmit(data: TransactionFormData) {
    const updated: Transaction = {
      ...data,
      id: existingTransaction.id,
    };
    console.log(updated);
  }

const formDefaults = Object.fromEntries(
  Object.entries(existingTransaction).filter(([k]) => k !== 'id')
) as Omit<Transaction, 'id'>;

  return (
    <TransactionForm
      onSubmit={handleFormSubmit}
      defaultValues={formDefaults}
    />
  );
}