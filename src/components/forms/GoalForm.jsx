import { useForm } from 'react-hook-form';
import Field from '../common/Field';
import { todayISO } from '../../utils/dateUtils';

export default function GoalForm({ initial, onSubmit, onCancel }) {
  const { register, handleSubmit, getValues, formState: { errors } } = useForm({ defaultValues: { name: '', target: '', saved: 0, deadline: '', ...initial } });
  const e = (k) => `input ${errors[k] ? 'input-error' : ''}`;
  return (
    <form onSubmit={handleSubmit((v) => onSubmit({ name: v.name.trim(), target: Number(v.target), saved: Number(v.saved), deadline: v.deadline }))} noValidate className="space-y-4">
      <Field label="Goal name" error={errors.name?.message}><input className={e('name')} maxLength={40} {...register('name', { required: 'Name is required', validate: (v) => !!v.trim() || 'Name is required' })} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Target amount" error={errors.target?.message}><input type="number" className={e('target')} {...register('target', { required: 'Target is required', validate: (v) => Number(v) > 0 || 'Must be greater than 0' })} /></Field>
        <Field label="Currently saved" error={errors.saved?.message}><input type="number" className={e('saved')} {...register('saved', { required: 'Enter 0 if nothing is saved yet', validate: (v) => Number(v) >= 0 || 'Cannot be negative' })} /></Field>
      </div>
      <Field label="Deadline" error={errors.deadline?.message}>
        <input type="date" className={e('deadline')} {...register('deadline', { required: 'Deadline is required', validate: (v) => initial?.id || v >= todayISO() || 'Deadline cannot be in the past' })} />
      </Field>
      <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button><button className="btn-primary">Save goal</button></div>
    </form>
  );
}
