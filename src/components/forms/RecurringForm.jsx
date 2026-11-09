import { useForm } from 'react-hook-form';
import Field from '../common/Field';
import { FREQUENCIES, PAYMENT_METHODS } from '../../utils/constants';
import { amountRule } from '../../utils/validators';
import { todayISO } from '../../utils/dateUtils';

export default function RecurringForm({ initial, categories, onSubmit, onCancel }) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { type: 'expense', amount: '', categoryId: '', frequency: 'monthly', startDate: todayISO(), endDate: '', paymentMethod: 'UPI', description: '', ...initial },
  });
  const type = watch('type'); const start = watch('startDate');
  const e = (k) => `input ${errors[k] ? 'input-error' : ''}`;
  return (
    <form onSubmit={handleSubmit((v) => onSubmit({ ...v, amount: Number(v.amount), description: v.description.trim() }))} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type"><select className="input" {...register('type', { onChange: () => setValue('categoryId', '') })}><option value="expense">Expense</option><option value="income">Income</option></select></Field>
        <Field label="Amount" error={errors.amount?.message}><input type="number" step="0.01" className={e('amount')} {...register('amount', amountRule)} /></Field>
        <Field label="Category" error={errors.categoryId?.message}>
          <select className={e('categoryId')} {...register('categoryId', { required: 'Choose a category' })}><option value="">Select category</option>{categories.filter((c) => c.type === type).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </Field>
        <Field label="Frequency"><select className="input" {...register('frequency')}>{FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}</select></Field>
        <Field label="Start date" error={errors.startDate?.message}><input type="date" className={e('startDate')} {...register('startDate', { required: 'Start date is required' })} /></Field>
        <Field label="End date (optional)" error={errors.endDate?.message}><input type="date" className={e('endDate')} {...register('endDate', { validate: (v) => !v || v >= start || 'End date must be after the start date' })} /></Field>
        <Field label="Payment method"><select className="input" {...register('paymentMethod')}>{PAYMENT_METHODS.map((p) => <option key={p}>{p}</option>)}</select></Field>
        <Field label="Description" error={errors.description?.message}><input className={e('description')} maxLength={60} {...register('description', { required: 'Description is required', validate: (v) => !!v.trim() || 'Description is required' })} /></Field>
      </div>
      <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button><button className="btn-primary">Save schedule</button></div>
    </form>
  );
}
