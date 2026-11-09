import { useForm } from 'react-hook-form';
import Field from '../common/Field';
import { PAYMENT_METHODS } from '../../utils/constants';
import { amountRule, notFuture } from '../../utils/validators';
import { todayISO } from '../../utils/dateUtils';

/** Reusable add/edit form. `categories` should already include the record's current category when editing. */
export default function TransactionForm({ initial, categories, onSubmit, onCancel, serverError, submitLabel = 'Save transaction' }) {
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { type: 'expense', amount: '', categoryId: '', date: todayISO(), paymentMethod: 'UPI', description: '', notes: '', ...initial },
  });
  const type = watch('type');
  const cats = categories.filter((c) => c.type === type);
  const cls = (e) => `input ${e ? 'input-error' : ''}`;
  return (
    <form onSubmit={handleSubmit((v) => onSubmit({ ...v, amount: Number(v.amount), description: v.description.trim(), notes: v.notes.trim() }))} noValidate className="space-y-4">
      {serverError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">{serverError}</p>}
      <div role="radiogroup" aria-label="Transaction type" className="grid grid-cols-2 gap-2">
        {['expense', 'income'].map((t) => (
          <label key={t} className={`cursor-pointer rounded-xl border px-4 py-2 text-center text-sm font-semibold focus-within:ring-2 focus-within:ring-brand-500 ${type === t ? (t === 'income' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300') : 'border-slate-300 dark:border-slate-700'}`}>
            <input type="radio" value={t} className="sr-only" {...register('type', { onChange: () => setValue('categoryId', '') })} />{t === 'income' ? 'Income' : 'Expense'}
          </label>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount" error={errors.amount?.message}><input type="number" step="0.01" inputMode="decimal" className={cls(errors.amount)} {...register('amount', amountRule)} /></Field>
        <Field label="Category" error={errors.categoryId?.message}>
          <select className={cls(errors.categoryId)} {...register('categoryId', { required: 'Choose a category' })}>
            <option value="">Select category</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Date" error={errors.date?.message}><input type="date" max={todayISO()} className={cls(errors.date)} {...register('date', { required: 'Date is required', validate: notFuture })} /></Field>
        <Field label="Payment method"><select className="input" {...register('paymentMethod')}>{PAYMENT_METHODS.map((p) => <option key={p}>{p}</option>)}</select></Field>
      </div>
      <Field label="Description" error={errors.description?.message}><input className={cls(errors.description)} maxLength={80} {...register('description', { required: 'Description is required', validate: (v) => !!v.trim() || 'Description is required' })} /></Field>
      <Field label="Notes (optional)"><textarea rows={2} maxLength={300} className="input" {...register('notes')} /></Field>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" disabled={isSubmitting}>{submitLabel}</button>
      </div>
    </form>
  );
}
