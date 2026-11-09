import { useState } from 'react';
import { AlertTriangle, Pencil, PiggyBank, Plus, Trash2 } from 'lucide-react';
import { useUserData } from '../../hooks/useUserData';
import { useFormat } from '../../hooks/useFormat';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { budgetUsage } from '../../utils/calculations';
import { todayISO } from '../../utils/dateUtils';
import PageHeader from '../../components/common/PageHeader';
import ProgressBar from '../../components/common/ProgressBar';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import BudgetForm from '../../components/forms/BudgetForm';
import BudgetBar from '../../components/charts/BudgetBar';

export default function Budgets() {
  const { transactions, budgets, categories, getCat } = useUserData();
  const { act } = useAppData(); const { user } = useAuth(); const { fmt } = useFormat(); const toast = useToast();
  const [month, setMonth] = useState(todayISO().slice(0, 7));
  const [edit, setEdit] = useState(null); const [del, setDel] = useState(null);
  const list = budgets.filter((b) => b.month === month).sort((a, b) => (a.categoryId ? 1 : 0) - (b.categoryId ? 1 : 0));
  const rows = list.map((b) => ({ b, u: budgetUsage(b, transactions), name: b.categoryId ? getCat(b.categoryId).name : 'Overall' }));
  const alerts = rows.filter((r) => r.u.status !== 'ok');
  const save = (v) => {
    if (edit.id) { act.updateBudget(edit.id, v); toast.success('Budget updated'); }
    else { act.addBudget({ ...v, month, userId: user.id }); toast.success('Budget created'); }
    setEdit(null);
  };
  return (
    <>
      <PageHeader title="Budgets" subtitle="Set monthly limits and track recorded spending against them.">
        <input type="month" className="input !w-auto" aria-label="Select month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
        <button className="btn-primary" onClick={() => setEdit({})}><Plus className="h-4 w-4" />Add budget</button>
      </PageHeader>
      {alerts.length > 0 && (
        <div className="mb-4 space-y-2" role="region" aria-label="Budget alerts">{alerts.map(({ b, u, name }) => (
          <p key={b.id} className={`flex items-center gap-2 rounded-xl p-3 text-sm ${u.status === 'over' ? 'bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200' : 'bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200'}`}>
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />{u.status === 'over' ? `${name} is over budget by ${fmt(-u.remaining)}.` : `${name} has reached ${Math.round(u.pct)}% of its limit (${fmt(u.remaining)} left).`}</p>))}</div>)}
      {rows.length === 0 ? <div className="card"><EmptyState icon={PiggyBank} title="No budgets for this month" text="Create an overall budget or limits for specific categories." action={<button className="btn-primary btn-sm" onClick={() => setEdit({})}>Add budget</button>} /></div> : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">{rows.map(({ b, u, name }) => (
            <article key={b.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div><h2 className="font-bold">{name} {u.status === 'over' && <span className="badge-red ml-1">Over budget</span>}{u.status === 'warn' && <span className="badge-amber ml-1">Near limit</span>}</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Limit {fmt(b.limit)} · Spent {fmt(u.spent)} · {u.remaining >= 0 ? `Remaining ${fmt(u.remaining)}` : `Over by ${fmt(-u.remaining)}`}</p></div>
                <div className="flex gap-1"><button className="icon-btn" aria-label={`Edit ${name} budget`} onClick={() => setEdit(b)}><Pencil className="h-4 w-4" /></button><button className="icon-btn hover:!text-rose-600" aria-label={`Delete ${name} budget`} onClick={() => setDel(b)}><Trash2 className="h-4 w-4" /></button></div>
              </div>
              <div className="mt-3"><ProgressBar pct={u.pct} status={u.status} label={`${name} budget used`} /><p className="mt-1 text-right text-xs font-semibold">{Math.round(u.pct)}% used</p></div>
            </article>))}</div>
          <section className="card" aria-labelledby="bs"><h2 id="bs" className="mb-3 font-bold">Budget vs spent</h2><BudgetBar data={rows.map(({ b, u, name }) => ({ label: name.split(' ')[0], limit: b.limit, spent: u.spent }))} /></section>
        </div>)}
      <Modal open={!!edit} title={edit?.id ? 'Edit budget' : 'Add budget'} onClose={() => setEdit(null)}>
        {edit && <BudgetForm initial={edit.id ? edit : undefined} month={month} categories={categories.filter((c) => c.type === 'expense')} existing={list} onSubmit={save} onCancel={() => setEdit(null)} />}
      </Modal>
      <ConfirmDialog open={!!del} message="Delete this budget? Your transactions are not affected." onCancel={() => setDel(null)} onConfirm={() => { act.deleteBudget(del.id); setDel(null); toast.success('Budget deleted'); }} />
    </>
  );
}
