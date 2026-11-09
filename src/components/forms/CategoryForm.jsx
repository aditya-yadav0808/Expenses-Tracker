import { useForm } from 'react-hook-form';
import Field from '../common/Field';
import { ICONS, CategoryIcon } from '../../utils/icons';
import { SWATCHES } from '../../utils/constants';

/** `existing` = categories to check duplicate names against. `lockType` disables the type select (category in use). */
export default function CategoryForm({ initial, existing, lockType, onSubmit, onCancel }) {
  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm({ defaultValues: { name: '', type: 'expense', icon: 'Tag', color: SWATCHES[0], ...initial } });
  const icon = watch('icon'); const color = watch('color');
  return (
    <form onSubmit={handleSubmit((v) => onSubmit({ ...v, name: v.name.trim() }))} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" error={errors.name?.message}>
          <input className={`input ${errors.name ? 'input-error' : ''}`} maxLength={30} {...register('name', {
            required: 'Name is required',
            validate: (v) => !existing.some((c) => c.id !== initial?.id && c.type === getValues('type') && c.name.toLowerCase() === v.trim().toLowerCase()) || 'A category with this name already exists',
          })} />
        </Field>
        <Field label="Type" hint={lockType ? 'Type is locked because transactions use this category.' : undefined}>
          <select className="input" disabled={lockType} {...register('type')}><option value="expense">Expense</option><option value="income">Income</option></select>
        </Field>
      </div>
      <fieldset><legend className="label">Icon</legend>
        <div className="flex flex-wrap gap-1.5">{Object.keys(ICONS).map((n) => (
          <button key={n} type="button" aria-label={n} aria-pressed={icon === n} onClick={() => setValue('icon', n)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border ${icon === n ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900' : 'border-slate-200 dark:border-slate-700'}`}><CategoryIcon name={n} className="h-4 w-4" /></button>))}</div>
      </fieldset>
      <fieldset><legend className="label">Color</legend>
        <div className="flex flex-wrap gap-2">{SWATCHES.map((c) => (
          <button key={c} type="button" aria-label={`Color ${c}`} aria-pressed={color === c} onClick={() => setValue('color', c)}
            className={`h-7 w-7 rounded-full ring-offset-2 dark:ring-offset-slate-900 ${color === c ? 'ring-2 ring-slate-800 dark:ring-white' : ''}`} style={{ background: c }} />))}</div>
      </fieldset>
      <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button><button className="btn-primary">Save category</button></div>
    </form>
  );
}
