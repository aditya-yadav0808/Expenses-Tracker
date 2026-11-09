import { Link } from 'react-router-dom';
import { Activity, ArrowDownRight, ArrowUpRight, ReceiptText, UserCheck, UserX, Users } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useFormat } from '../../hooks/useFormat';
import { groupSeries, inRange, totals } from '../../utils/calculations';
import { addMonthKey, monthLabel, todayISO } from '../../utils/dateUtils';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import BarSeries, { INCOME_EXPENSE } from '../../components/charts/BarSeries';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';

export const RECORDS_NOTE = 'All figures are totals of transactions recorded in this application. They are not company revenue and not bank balances; MoneyWise has no access to real bank accounts.';

export default function AdminDashboard() {
  const { data } = useAppData();
  const { fmt, date, dateTime } = useFormat();
  const today = todayISO(); const mk = today.slice(0, 7);
  const users = data.users; const t = totals(data.transactions);
  const active = users.filter((u) => u.status === 'active').length;
  const months = Array.from({ length: 12 }, (_, i) => addMonthKey(mk, i - 11));
  const regs = months.map((k) => ({ label: monthLabel(k), users: users.filter((u) => u.createdAt.startsWith(k)).length }));
  const from = `${months[5]}-01`;
  const activity = groupSeries(inRange(data.transactions, from, today), 'month', from, today);
  const recent = [...users].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  return (
    <>
      <PageHeader title="Admin dashboard" subtitle={RECORDS_NOTE} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Registered users" value={users.length} icon={Users} />
        <StatCard label="Active accounts" value={active} icon={UserCheck} tone="green" />
        <StatCard label="Inactive accounts" value={users.length - active} icon={UserX} tone="amber" />
        <StatCard label="Recorded transactions" value={data.transactions.length} icon={ReceiptText} />
        <StatCard label="Recorded income (all users)" value={fmt(t.income)} sub="Sum of income records" icon={ArrowUpRight} tone="green" />
        <StatCard label="Recorded expenses (all users)" value={fmt(t.expense)} sub="Sum of expense records" icon={ArrowDownRight} tone="red" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card" aria-labelledby="a1"><h2 id="a1" className="mb-4 font-bold">New registrations (12 months)</h2><BarSeries data={regs} money={false} series={[{ key: 'users', name: 'New users', color: '#0e7490' }]} /></section>
        <section className="card" aria-labelledby="a2"><h2 id="a2" className="mb-4 font-bold">Transaction activity (recorded totals)</h2><BarSeries data={activity} series={INCOME_EXPENSE} /></section>
        <section className="card" aria-labelledby="a3">
          <div className="mb-3 flex justify-between"><h2 id="a3" className="font-bold">Recent registrations</h2><Link to="/admin/users" className="text-xs font-semibold text-brand-700 hover:underline dark:text-brand-400">All users</Link></div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">{recent.map((u) => <li key={u.id} className="flex items-center gap-3 py-2.5"><Avatar name={u.name} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{u.name}</p><p className="truncate text-xs text-slate-500">{u.email}</p></div><span className="text-xs text-slate-500">{date(u.createdAt)}</span></li>)}</ul>
        </section>
        <section className="card" aria-labelledby="a4">
          <div className="mb-3 flex justify-between"><h2 id="a4" className="font-bold">Recent administrative activity</h2><Link to="/admin/audit-logs" className="text-xs font-semibold text-brand-700 hover:underline dark:text-brand-400">Audit logs</Link></div>
          {data.audit.length ? <ul className="space-y-3">{data.audit.slice(0, 5).map((a) => <li key={a.id} className="flex items-start gap-3 text-sm"><Activity className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" /><div><p className="font-medium">{a.action.replaceAll('_', ' ').toLowerCase()} <span className="text-slate-500">· {a.target}</span></p><p className="text-xs text-slate-500">{a.actor} · {dateTime(a.timestamp)}</p></div></li>)}</ul> : <EmptyState title="No activity yet" />}
        </section>
      </div>
    </>
  );
}
