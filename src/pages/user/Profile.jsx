import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../components/common/Toast';
import { useFormat } from '../../hooks/useFormat';
import Avatar from '../../components/common/Avatar';
import Field from '../../components/common/Field';
import PageHeader from '../../components/common/PageHeader';
import { emailRule, passwordRule } from '../../utils/validators';

export default function Profile() {
  const { user, changePassword } = useAuth();
  const { data, act } = useAppData(); const toast = useToast(); const { date } = useFormat();
  const p = useForm({ defaultValues: { name: user.name, email: user.email } });
  const w = useForm({ defaultValues: { current: '', next: '', confirm: '' } });
  const [pwErr, setPwErr] = useState('');
  const saveProfile = (v) => {
    if (data.users.some((u) => u.id !== user.id && u.email.toLowerCase() === v.email.trim().toLowerCase())) return p.setError('email', { message: 'Another account already uses this email' });
    act.updateUser(user.id, { name: v.name.trim(), email: v.email.trim() }); toast.success('Profile updated');
  };
  const savePw = async (v) => {
    const r = await changePassword(v.current, v.next);
    if (!r.ok) return setPwErr(r.error);
    setPwErr(''); w.reset(); toast.success('Password changed');
  };
  return (
    <>
      <PageHeader title="Profile" subtitle="Your personal details." />
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card flex flex-col items-center text-center"><Avatar name={user.name} size="h-20 w-20 text-2xl" /><h2 className="mt-3 text-lg font-bold">{user.name}</h2><p className="text-sm text-slate-500">{user.email}</p><span className="badge-brand mt-2 capitalize">{user.role}</span>
          <dl className="mt-4 w-full space-y-1 text-left text-xs text-slate-500"><div className="flex justify-between"><dt>Member since</dt><dd>{date(user.createdAt)}</dd></div><div className="flex justify-between"><dt>Last login</dt><dd>{date(user.lastLogin)}</dd></div></dl></section>
        <div className="space-y-6 lg:col-span-2">
          <form onSubmit={p.handleSubmit(saveProfile)} noValidate className="card space-y-4" aria-label="Edit profile">
            <h2 className="font-bold">Edit details</h2>
            <Field label="Display name" error={p.formState.errors.name?.message}><input className="input" {...p.register('name', { required: 'Name is required', validate: (v) => !!v.trim() || 'Name is required' })} /></Field>
            <Field label="Email" error={p.formState.errors.email?.message}><input type="email" className="input" {...p.register('email', emailRule)} /></Field>
            <div className="flex justify-end"><button className="btn-primary">Save changes</button></div>
          </form>
          <form onSubmit={w.handleSubmit(savePw)} noValidate className="card space-y-4" aria-label="Change password">
            <h2 className="font-bold">Change password</h2>
            {pwErr && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">{pwErr}</p>}
            <Field label="Current password" error={w.formState.errors.current?.message}><input type="password" autoComplete="current-password" className="input" {...w.register('current', { required: 'Enter your current password' })} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="New password" error={w.formState.errors.next?.message}><input type="password" autoComplete="new-password" className="input" {...w.register('next', passwordRule)} /></Field>
              <Field label="Confirm new password" error={w.formState.errors.confirm?.message}><input type="password" autoComplete="new-password" className="input" {...w.register('confirm', { required: 'Confirm the new password', validate: (v) => v === w.getValues('next') || 'Passwords do not match' })} /></Field>
            </div>
            <div className="flex justify-end"><button className="btn-primary">Update password</button></div>
          </form>
        </div>
      </div>
    </>
  );
}
