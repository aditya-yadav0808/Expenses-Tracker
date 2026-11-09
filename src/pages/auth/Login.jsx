import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import Field from '../../components/common/Field';
import { useAuth } from '../../context/AuthContext';
import { emailRule } from '../../utils/validators';
import { homeFor } from '../../utils/constants';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const from = useLocation().state?.from;
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { email: '', password: '', remember: false } });

  const finish = async (p) => {
    const r = await p;
    if (!r.ok) return setError(r.error);
    const target = from && (r.user.role === 'admin') === from.startsWith('/admin') ? from : homeFor(r.user.role);
    nav(target, { replace: true });
  };
  return (
    <div>
      <h1 className="text-3xl font-extrabold">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-500">Log in to manage your money.</p>
      <form onSubmit={handleSubmit((v) => finish(login(v)))} noValidate className="mt-6 space-y-4">
        {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">{error}</p>}
        <Field label="Email" error={errors.email?.message}><input type="email" autoComplete="email" className={`input ${errors.email ? 'input-error' : ''}`} {...register('email', emailRule)} /></Field>
        <Field label="Password" error={errors.password?.message}>
          <div className="relative">
            <input type={show ? 'text' : 'password'} autoComplete="current-password" className={`input !pr-10 ${errors.password ? 'input-error' : ''}`} {...register('password', { required: 'Password is required' })} />
            <button type="button" className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-700" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
          </div>
        </Field>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4 rounded" {...register('remember')} />Remember me</label>
          <Link to="/forgot-password" className="font-semibold text-brand-700 hover:underline dark:text-brand-400">Forgot password?</Link>
        </div>
        <button className="btn-primary w-full" disabled={isSubmitting}>Log in</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">New here? <Link to="/register" className="font-semibold text-brand-700 hover:underline dark:text-brand-400">Create an account</Link></p>
    </div>
  );
}
