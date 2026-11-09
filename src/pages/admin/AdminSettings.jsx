import { Check, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../components/common/Toast';
import PageHeader from '../../components/common/PageHeader';
import Field from '../../components/common/Field';
import Segmented from '../../components/common/Segmented';
import Avatar from '../../components/common/Avatar';
import { Toggle } from '../user/Settings';
import { CURRENCIES } from '../../utils/currency';
import { PERMISSIONS } from '../../utils/constants';

export default function AdminSettings() {
  const { user } = useAuth(); const { data, act } = useAppData(); const { theme, setTheme } = useTheme(); const toast = useToast();
  const prof = useForm({ defaultValues: { name: user.name } });
  const cfg = useForm({ defaultValues: { ...data.appConfig } });
  const setPref = (patch) => { act.updateUser(user.id, { prefs: { ...user.prefs, ...patch } }); toast.success('Preference saved'); };
  const saveCfg = (v) => {
    const next = { appName: v.appName.trim(), allowRegistration: !!v.allowRegistration, defaultCurrency: v.defaultCurrency, maintenanceBanner: !!v.maintenanceBanner, sessionTimeoutMin: Number(v.sessionTimeoutMin) };
    const changed = Object.keys(next).filter((k) => next[k] !== data.appConfig[k]);
    if (!changed.length) return toast.info('No changes to save');
    act.updateConfig(next); act.audit(user, 'SETTINGS_UPDATED', 'appConfig', `Changed: ${changed.join(', ')}`); toast.success('Application settings saved');
  };
  return (
    <>
      <PageHeader title="Admin settings" subtitle="Your profile, preferences and application configuration." />
      <div className="grid gap-6 lg:grid-cols-2">
        <form className="card space-y-4" onSubmit={prof.handleSubmit((v) => { act.updateUser(user.id, { name: v.name.trim() }); toast.success('Profile updated'); })} noValidate aria-label="Admin profile">
          <h2 className="font-bold">Admin profile</h2>
          <div className="flex items-center gap-3"><Avatar name={user.name} size="h-14 w-14 text-lg" /><div><p className="font-semibold">{user.email}</p><span className="badge-brand">admin</span></div></div>
          <Field label="Display name" error={prof.formState.errors.name?.message}><input className="input" {...prof.register('name', { required: 'Name is required', validate: (v) => !!v.trim() || 'Name is required' })} /></Field>
          <div className="flex justify-end"><button className="btn-primary">Save profile</button></div>
        </form>
        <section className="card" aria-labelledby="ap"><h2 id="ap" className="mb-3 font-bold">Preferences</h2>
          <div className="flex items-center justify-between py-2 text-sm"><span>Theme</span><Segmented label="Theme" value={theme} onChange={setTheme} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} /></div>
          <Toggle label="Notify me about new registrations" checked={user.prefs.adminNotifySignups !== false} onChange={(v) => setPref({ adminNotifySignups: v })} />
          <Toggle label="Notify me about role and status changes" checked={user.prefs.adminNotifyChanges !== false} onChange={(v) => setPref({ adminNotifyChanges: v })} />
          <p className="mt-1 text-xs text-slate-500">Preference storage only; delivery needs a backend.</p></section>
        <form className="card space-y-4 lg:col-span-2" onSubmit={cfg.handleSubmit(saveCfg)} noValidate aria-label="Application configuration">
          <h2 className="font-bold">Application configuration</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Application name" error={cfg.formState.errors.appName?.message}><input className="input" {...cfg.register('appName', { required: 'Name is required', validate: (v) => !!v.trim() || 'Name is required' })} /></Field>
            <Field label="Default currency for new accounts"><select className="input" {...cfg.register('defaultCurrency')}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Session timeout (minutes)" hint="Informational only." error={cfg.formState.errors.sessionTimeoutMin?.message}><input type="number" className="input" {...cfg.register('sessionTimeoutMin', { min: { value: 5, message: 'Minimum 5' }, max: { value: 240, message: 'Maximum 240' } })} /></Field>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 rounded" {...cfg.register('allowRegistration')} />Allow new user registrations</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 rounded" {...cfg.register('maintenanceBanner')} />Show a maintenance notice banner to all users</label>
          <div className="flex justify-end"><button className="btn-primary">Save configuration</button></div>
        </form>
        <section className="card overflow-x-auto lg:col-span-2" aria-labelledby="rp"><h2 id="rp" className="mb-1 font-bold">Roles & permissions overview</h2><p className="mb-3 text-xs text-slate-500">Descriptive only. In production these rules are enforced by Spring Security, not by this UI.</p>
          <table className="w-full min-w-[480px] text-sm"><thead><tr><th className="th pl-0">Capability</th><th className="th text-center">User</th><th className="th text-center">Admin</th></tr></thead>
            <tbody>{PERMISSIONS.map((p) => <tr key={p.name} className="tr"><td className="py-2.5">{p.name}</td>{[p.user, p.admin].map((ok, i) => <td key={i} className="py-2.5 text-center">{ok ? <Check className="mx-auto h-4 w-4 text-emerald-600" aria-label="Allowed" /> : <X className="mx-auto h-4 w-4 text-slate-300" aria-label="Not allowed" />}</td>)}</tr>)}</tbody></table></section>
      </div>
    </>
  );
}
