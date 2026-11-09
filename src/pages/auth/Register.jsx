import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Field from '../../components/common/Field';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { emailRule, passwordRule, passwordStrength } from '../../utils/validators';
import { homeFor } from '../../utils/constants';

export default function Register() {
  const { register: signUp } = useAuth();
  const toast = useToast(); const nav = useNavigate();
  const [error, setError] = useState('');
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { name: '', email: '', password: '', confirm: '', terms: false } });
  const pw = watch('password'); const s = passwordStrength(pw);
  const bar = ['bg-slate-300', 'bg-rose-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-500'][s.score];
  const e = (k) => `input ${errors[k] ? 'input-error' : ''}`;
  const submit = async (v) => {
    const r = await signUp(v);
    if (!r.ok) return setError(r.error);
    toast.success('Account created. Welcome to MoneyWise!'); nav(homeFor(r.user.role), { replace: true });
  };
  return (
    <div>
      <h1 className="text-3xl font-extrabold">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">Your account is saved permanently.</p>
      <form onSubmit={handleSubmit(submit)} noValidate className="mt-6 space-y-4">
        {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">{error}</p>}
        <Field label="Full name" error={errors.name?.message}><input autoComplete="name" className={e('name')} {...register('name', { required: 'Full name is required', minLength: { value: 2, message: 'Enter your full name' }, validate: (v) => !!v.trim() || 'Full name is required' })} /></Field>
        <Field label="Email" error={errors.email?.message}><input type="email" autoComplete="email" className={e('email')} {...register('email', emailRule)} /></Field>
        <div>
          <Field label="Password" error={errors.password?.message}><input type="password" autoComplete="new-password" className={e('password')} {...register('password', passwordRule)} /></Field>
          <div className="mt-2" aria-live="polite">
            <div className="flex gap-1">{[1, 2, 3, 4].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= s.score ? bar : 'bg-slate-200 dark:bg-slate-700'}`} />)}</div>
            {pw && <p className="mt-1 text-xs text-slate-500">Strength: {s.label}</p>}
          </div>
        </div>
        <Field label="Confirm password" error={errors.confirm?.message}><input type="password" autoComplete="new-password" className={e('confirm')} {...register('confirm', { required: 'Confirm your password', validate: (v) => v === pw || 'Passwords do not match' })} /></Field>
        <div>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-0.5 h-4 w-4 rounded" {...register('terms', { required: 'You must accept the terms to continue' })} />I agree to the Terms and Conditions and Privacy Policy.</label>
          {errors.terms && <p role="alert" className="mt-1 text-xs font-medium text-rose-600">{errors.terms.message}</p>}
        </div>
        <button className="btn-primary w-full">Create account</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">Already registered? <Link to="/login" className="font-semibold text-brand-700 hover:underline dark:text-brand-400">Log in</Link></p>
    </div>
  );
}
