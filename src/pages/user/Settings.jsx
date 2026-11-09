import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../components/common/Toast';
import PageHeader from '../../components/common/PageHeader';
import Segmented from '../../components/common/Segmented';
import { CURRENCIES } from '../../utils/currency';
import { DATE_FORMATS } from '../../utils/constants';

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-2 text-sm"><span>{label}</span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${checked ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-600'}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} /></button></label>
  );
}

export default function Settings() {
  const { user, logout } = useAuth(); const { act } = useAppData(); const { theme, setTheme } = useTheme(); const toast = useToast(); const nav = useNavigate();
  const setPref = (patch) => { act.updateUser(user.id, { prefs: { ...user.prefs, ...patch } }); toast.success('Preference saved'); };
  return (
    <>
      <PageHeader title="Settings" subtitle="Your preferences are saved with your account." />
      <div className="grid max-w-3xl gap-6">
        <section className="card" aria-labelledby="s1"><h2 id="s1" className="mb-3 font-bold">Appearance & format</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3"><span className="text-sm">Theme</span><Segmented label="Theme" value={theme} onChange={setTheme} options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]} /></div>
            <label className="flex items-center justify-between gap-3 text-sm"><span>Currency <span className="block text-xs text-slate-500">Display only; amounts are not converted.</span></span><select className="input !w-36" value={user.prefs.currency} onChange={(e) => setPref({ currency: e.target.value })}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select></label>
            <label className="flex items-center justify-between gap-3 text-sm"><span>Date format</span><select className="input !w-36" value={user.prefs.dateFormat} onChange={(e) => setPref({ dateFormat: e.target.value })}>{DATE_FORMATS.map((c) => <option key={c}>{c}</option>)}</select></label>
          </div></section>
        <section className="card" aria-labelledby="s2"><h2 id="s2" className="mb-2 font-bold">Notifications</h2>
          <Toggle label="Budget warnings and overspending alerts" checked={user.prefs.notifyBudget !== false} onChange={(v) => setPref({ notifyBudget: v })} />
          <Toggle label="Recurring payment reminders" checked={user.prefs.notifyRecurring !== false} onChange={(v) => setPref({ notifyRecurring: v })} />
          <Toggle label="Savings goal reminders" checked={user.prefs.notifyGoals !== false} onChange={(v) => setPref({ notifyGoals: v })} />
          <p className="mt-2 text-xs text-slate-500">In-app only. Email or push notifications need a backend.</p></section>
        <section className="card" aria-labelledby="s3"><h2 id="s3" className="mb-3 font-bold">Account & data</h2>
          <div className="flex flex-wrap gap-3">
            <button className="btn-ghost" onClick={() => { logout(); nav('/login', { replace: true }); }}><LogOut className="h-4 w-4" />Log out</button>
          </div></section>
      </div>
    </>
  );
}
