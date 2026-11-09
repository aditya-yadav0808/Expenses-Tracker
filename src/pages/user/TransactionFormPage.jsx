import { useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import TransactionForm from '../../components/forms/TransactionForm';
import { useUserData } from '../../hooks/useUserData';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';

/** Serves both /transactions/new and /transactions/:id/edit. */
export default function TransactionFormPage() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const { user } = useAuth(); const { act } = useAppData(); const toast = useToast(); const nav = useNavigate();
  const { transactions, categories, getCat } = useUserData();
  const [error, setError] = useState('');
  const existing = id ? transactions.find((t) => t.id === id) : null;
  if (id && !existing) return <Navigate to="/transactions" replace />;
  // keep the record's current category selectable even if an admin has since disabled it
  const cats = existing && !categories.some((c) => c.id === existing.categoryId) ? [...categories, getCat(existing.categoryId)].filter((c) => c.id) : categories;

  const submit = (v) => {
    if (existing) { act.updateTransaction(existing.id, v); toast.success('Transaction updated'); return nav('/transactions'); }
    const added = act.addTransaction({ ...v, userId: user.id });
    if (!added) return setError('A matching transaction already exists. Change the amount, date or description if this is a different one.');
    toast.success('Transaction saved'); nav('/transactions');
  };
  const initial = existing ? { ...existing, amount: String(existing.amount) } : sp.get('type') === 'income' ? { type: 'income' } : undefined;
  return (
    <>
      <PageHeader title={existing ? 'Edit transaction' : 'Add transaction'} subtitle="Only record things that have already happened. Use Recurring for scheduled items." />
      <div className="card max-w-2xl"><TransactionForm initial={initial} categories={cats} serverError={error} onSubmit={submit} onCancel={() => nav('/transactions')} submitLabel={existing ? 'Save changes' : 'Save transaction'} /></div>
    </>
  );
}
