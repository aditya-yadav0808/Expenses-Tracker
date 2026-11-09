import { useForm } from 'react-hook-form';
import Field from '../common/Field';

export default function BudgetForm({ initial, month, categories, existing, onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { limit: '', ...initial, categoryId: initial?.categoryId || '' } });
  return (
    <form onSubmit={handleSubmit((v) => onSubmit({ categoryId: v.categoryId || null, limit: Number(v.limit) }))} noValidate className="space-y-4">
      <Field label="Budget for" error={errors.categoryId?.message}>
        <select className="input" {...register('categoryId', { validate: (v) => !existing.some((b) => b.id !== initial?.id && (b.categoryId || '') === v) || 'A budget for this category already exists this month' })}>
          <option value="">Overall monthly budget</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>
      <Field label={`Monthly limit (${month})`} error={errors.limit?.message}>
        <input type="number" className={`input ${errors.limit ? 'input-error' : ''}`} {...register('limit', { required: 'Limit is required', validate: (v) => Number(v) > 0 || 'Limit must be greater than 0' })} />
      </Field>
      <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button><button className="btn-primary">Save budget</button></div>
    </form>
  );
}
