import { useState } from 'react';
import { CalendarCheck, Pause, Pencil, Play, Plus, Repeat, Trash2 } from 'lucide-react';
import { useUserData } from '../../hooks/useUserData';
import { useFormat } from '../../hooks/useFormat';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { dueOccurrences, effectiveStatus, nextOccurrence } from '../../utils/calculations';
import { todayISO } from '../../utils/dateUtils';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import RecurringForm from '../../components/forms/RecurringForm';
import CategoryBadge from '../../components/common/CategoryBadge';

const BADGE = { active: 'badge-green', paused: 'badge-amber', completed: 'badge-slate' };

export default function RecurringTransactions() {
  const { recurring, transactions, categories, getCat } = useUserData();
  const { act } = useAppData(); const { user } = useAuth(); const { fmt, date } = useFormat(); const toast = useToast();
  const [edit, setEdit] = useState(null); const [del, setDel] = useState(null);
  const today = todayISO();
  const rows = recurring.map((r) => ({ r, status: effectiveStatus(r, transactions, today), due: r.status === 'paused' ? [] : dueOccurrences(r, transactions, today), next: nextOccurrence(r, today), recorded: transactions.filter((t) => t.recurringId === r.id).length }));
  const totalDue = rows.reduce((s, x) => s + x.due.length, 0);

  /** Records due occurrences as real transactions. The (recurringId, dueDate) pair prevents duplicates. */
  const generate = (list) => {
    const txs = list.flatMap(({ r, due }) => due.map((d) => ({ userId: user.id, type: r.type, amount: r.amount, categoryId: r.categoryId, date: d, paymentMethod: r.paymentMethod, description: r.description, notes: 'Recorded from recurring schedule', recurringId: r.id, dueDate: d })));
    const added = act.addTransactions(txs);
    added.length ? toast.success(`${added.length} transaction(s) recorded`) : toast.info('Nothing new to record');
  };
  const save = (v) => {
    if (edit.id) { act.updateRecurring(edit.id, { ...v, endDate: v.endDate || '' }); toast.success('Schedule updated'); }
    else { act.addRecurring({ ...v, endDate: v.endDate || '', userId: user.id, status: 'active' }); toast.success('Schedule created'); }
    setEdit(null);
  };
  return (
    <>
      <PageHeader title="Recurring transactions" subtitle="Schedules are plans, not records. A transaction only exists once you record it.">
        {totalDue > 0 && <button className="btn-ghost" onClick={() => generate(rows)}><CalendarCheck className="h-4 w-4" />Record all due ({totalDue})</button>}
        <button className="btn-primary" onClick={() => setEdit({})}><Plus className="h-4 w-4" />Add schedule</button>
      </PageHeader>
      {rows.length === 0 ? <div className="card"><EmptyState icon={Repeat} title="No recurring schedules" text="Add rent, salary, subscriptions and other repeating items." action={<button className="btn-primary btn-sm" onClick={() => setEdit({})}>Add schedule</button>} /></div> : (
        <div className="card overflow-hidden !p-0"><div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50"><tr><th className="th" scope="col">Schedule</th><th className="th" scope="col">Category</th><th className="th" scope="col">Frequency</th><th className="th" scope="col">Next / due</th><th className="th" scope="col">Status</th><th className="th text-right" scope="col">Amount</th><th className="th text-right" scope="col">Actions</th></tr></thead>
            <tbody>{rows.map(({ r, status, due, next, recorded }) => (
              <tr key={r.id} className="tr">
                <td className="td"><p className="font-medium">{r.description}</p><p className="text-xs text-slate-500">{recorded} recorded · from {date(r.startDate)}{r.endDate && ` to ${date(r.endDate)}`}</p></td>
                <td className="td"><CategoryBadge cat={getCat(r.categoryId)} /></td>
                <td className="td capitalize">{r.frequency}</td>
                <td className="td">{due.length ? <span className="badge-amber">{due.length} due · since {date(due[0])}</span> : next && status === 'active' ? <span className="text-slate-500">Scheduled {date(next)}</span> : '—'}</td>
                <td className="td"><span className={BADGE[status]}>{status}</span></td>
                <td className={`td text-right font-bold ${r.type === 'income' ? 'text-emerald-600' : ''}`}>{r.type === 'income' ? '+' : ''}{fmt(r.amount)}</td>
                <td className="td"><div className="flex justify-end gap-1">
                  {due.length > 0 && <button className="btn-primary btn-sm" onClick={() => generate([{ r, due }])}>Record due</button>}
                  {status !== 'completed' && <button className="icon-btn" aria-label={r.status === 'paused' ? `Resume ${r.description}` : `Pause ${r.description}`} onClick={() => { act.updateRecurring(r.id, { status: r.status === 'paused' ? 'active' : 'paused' }); toast.success(r.status === 'paused' ? 'Schedule resumed' : 'Schedule paused'); }}>{r.status === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}</button>}
                  <button className="icon-btn" aria-label={`Edit ${r.description}`} onClick={() => setEdit(r)}><Pencil className="h-4 w-4" /></button>
                  <button className="icon-btn hover:!text-rose-600" aria-label={`Delete ${r.description}`} onClick={() => setDel(r)}><Trash2 className="h-4 w-4" /></button>
                </div></td>
              </tr>))}</tbody>
          </table></div></div>)}
      <Modal open={!!edit} wide title={edit?.id ? 'Edit schedule' : 'Add recurring schedule'} onClose={() => setEdit(null)}>{edit && <RecurringForm initial={edit.id ? edit : undefined} categories={categories} onSubmit={save} onCancel={() => setEdit(null)} />}</Modal>
      <ConfirmDialog open={!!del} message={`Delete the schedule “${del?.description}”? Transactions already recorded from it are kept.`} onCancel={() => setDel(null)} onConfirm={() => { act.deleteRecurring(del.id); setDel(null); toast.success('Schedule deleted'); }} />
    </>
  );
}
