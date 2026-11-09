import { useState } from 'react';
import { CalendarClock, CheckCircle2, Coins, Pencil, Plus, Target, Trash2 } from 'lucide-react';
import { useUserData } from '../../hooks/useUserData';
import { useFormat } from '../../hooks/useFormat';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { daysBetween, todayISO } from '../../utils/dateUtils';
import PageHeader from '../../components/common/PageHeader';
import ProgressBar from '../../components/common/ProgressBar';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import GoalForm from '../../components/forms/GoalForm';
import Field from '../../components/common/Field';

const statusOf = (g) => {
  if (g.saved >= g.target) return { key: 'done', label: 'Completed', cls: 'badge-green' };
  const d = daysBetween(todayISO(), g.deadline);
  if (d < 0) return { key: 'over', label: 'Past deadline', cls: 'badge-red', d };
  if (d <= 14) return { key: 'warn', label: `Due in ${d} day${d === 1 ? '' : 's'}`, cls: 'badge-amber', d };
  return { key: 'ok', label: 'On track', cls: 'badge-brand', d };
};

export default function SavingsGoals() {
  const { goals } = useUserData();
  const { act } = useAppData(); const { user } = useAuth(); const { fmt, date } = useFormat(); const toast = useToast();
  const [edit, setEdit] = useState(null); const [del, setDel] = useState(null); const [add, setAdd] = useState(null); const [amt, setAmt] = useState(''); const [err, setErr] = useState('');
  const reminders = goals.map((g) => ({ g, s: statusOf(g) })).filter((x) => x.s.key === 'warn' || x.s.key === 'over');
  const save = (v) => { if (edit.id) { act.updateGoal(edit.id, v); toast.success('Goal updated'); } else { act.addGoal({ ...v, userId: user.id }); toast.success('Goal created'); } setEdit(null); };
  const addMoney = (e) => {
    e.preventDefault(); const n = Number(amt);
    if (!(n > 0)) return setErr('Enter an amount greater than 0');
    act.updateGoal(add.id, { saved: add.saved + n }); toast.success(`${fmt(n)} added to ${add.name}`); setAdd(null); setAmt(''); setErr('');
  };
  return (
    <>
      <PageHeader title="Savings goals" subtitle="Track what you are setting aside. Contributions here are tracked separately from transactions."><button className="btn-primary" onClick={() => setEdit({})}><Plus className="h-4 w-4" />New goal</button></PageHeader>
      {reminders.length > 0 && <div className="mb-4 space-y-2" role="region" aria-label="Goal reminders">{reminders.map(({ g, s }) => <p key={g.id} className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200"><CalendarClock className="h-4 w-4 shrink-0" aria-hidden="true" />{g.name}: {s.key === 'over' ? 'deadline has passed' : s.label.toLowerCase()} — {fmt(g.target - g.saved)} still needed.</p>)}</div>}
      {goals.length === 0 ? <div className="card"><EmptyState icon={Target} title="No savings goals yet" text="Create a goal for something you are saving toward." action={<button className="btn-primary btn-sm" onClick={() => setEdit({})}>Create goal</button>} /></div> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{goals.map((g) => { const s = statusOf(g); const pct = Math.min(100, (g.saved / g.target) * 100); return (
          <article key={g.id} className="card flex flex-col">
            <div className="flex items-start justify-between gap-2"><h2 className="font-bold">{g.name}</h2><span className={s.cls}>{s.key === 'done' && <CheckCircle2 className="h-3 w-3" />}{s.label}</span></div>
            <p className="mt-3 text-2xl font-extrabold">{fmt(g.saved)} <span className="text-sm font-medium text-slate-500">of {fmt(g.target)}</span></p>
            <div className="mt-3"><ProgressBar pct={pct} status={s.key === 'done' ? 'done' : s.key === 'over' ? 'over' : s.key === 'warn' ? 'warn' : 'ok'} label={`${g.name} progress`} /></div>
            <p className="mt-2 flex justify-between text-xs text-slate-500"><span>{Math.round(pct)}% complete</span><span>{g.saved >= g.target ? 'Goal reached' : `${fmt(g.target - g.saved)} remaining`}</span></p>
            <p className="mt-1 text-xs text-slate-500">Deadline {date(g.deadline)}</p>
            <div className="mt-4 flex items-center gap-2 pt-1">
              <button className="btn-primary btn-sm flex-1" onClick={() => { setAdd(g); setAmt(''); setErr(''); }}><Coins className="h-3.5 w-3.5" />Add money</button>
              <button className="icon-btn" aria-label={`Edit ${g.name}`} onClick={() => setEdit(g)}><Pencil className="h-4 w-4" /></button>
              <button className="icon-btn hover:!text-rose-600" aria-label={`Delete ${g.name}`} onClick={() => setDel(g)}><Trash2 className="h-4 w-4" /></button>
            </div>
          </article>); })}</div>)}
      <Modal open={!!edit} title={edit?.id ? 'Edit goal' : 'New savings goal'} onClose={() => setEdit(null)}>{edit && <GoalForm initial={edit.id ? edit : undefined} onSubmit={save} onCancel={() => setEdit(null)} />}</Modal>
      <Modal open={!!add} title={`Add money to ${add?.name}`} onClose={() => setAdd(null)}>
        <form onSubmit={addMoney} noValidate className="space-y-4">
          <Field label="Amount" error={err}><input autoFocus type="number" className={`input ${err ? 'input-error' : ''}`} value={amt} onChange={(e) => setAmt(e.target.value)} /></Field>
          {add && <p className="text-xs text-slate-500">{fmt(add.target - add.saved > 0 ? add.target - add.saved : 0)} left to reach the target.</p>}
          <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setAdd(null)}>Cancel</button><button className="btn-primary">Add money</button></div>
        </form>
      </Modal>
      <ConfirmDialog open={!!del} message={`Delete the goal “${del?.name}”? Your progress will be lost.`} onCancel={() => setDel(null)} onConfirm={() => { act.deleteGoal(del.id); setDel(null); toast.success('Goal deleted'); }} />
    </>
  );
}
