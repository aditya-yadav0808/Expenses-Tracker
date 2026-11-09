import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MailCheck } from 'lucide-react';
import Field from '../../components/common/Field';
import { emailRule } from '../../utils/validators';

export default function ForgotPassword() {
  const [sent, setSent] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { email: '' } });
  return (
    <div>
      <h1 className="text-3xl font-extrabold">Reset your password</h1>
      <p className="mt-1 text-sm text-slate-500">Enter the email linked to your account.</p>
      <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200">No email is sent from this app. Ask an administrator to help, or change your password from Profile after logging in.</p>
      {sent ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center dark:border-emerald-900 dark:bg-emerald-950" role="status">
          <MailCheck className="mx-auto h-8 w-8 text-emerald-600" />
          <p className="mt-2 font-semibold">Check your inbox (simulated)</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">If an account exists for {sent}, a reset link would be sent.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit((v) => setSent(v.email))} noValidate className="mt-6 space-y-4">
          <Field label="Email" error={errors.email?.message}><input type="email" autoComplete="email" className={`input ${errors.email ? 'input-error' : ''}`} {...register('email', emailRule)} /></Field>
          <button className="btn-primary w-full">Send reset link</button>
        </form>
      )}
      <p className="mt-6 text-center text-sm"><Link to="/login" className="font-semibold text-brand-700 hover:underline dark:text-brand-400">Back to log in</Link></p>
    </div>
  );
}
