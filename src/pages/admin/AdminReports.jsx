import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useFormat } from '../../hooks/useFormat';
import { useToast } from '../../components/common/Toast';
import { groupSeries, inRange, totals } from '../../utils/calculations';
import { addMonthKey, monthKey, monthLabel, todayISO } from '../../utils/dateUtils';
import { downloadCSV } from '../../utils/csv';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import BarSeries, { INCOME_EXPENSE } from '../../components/charts/BarSeries';
import LineSeries from '../../components/charts/LineSeries';
import { RECORDS_NOTE } from './AdminDashboard';
import { Users, UserCheck, ReceiptText } from 'lucide-react';

const today = todayISO();
export default function AdminReports() {
  const { data } = useAppData(); const { fmt } = useFormat(); const toast = useToast();
  const [range, setRange] = useState({ from: `${addMonthKey(today.slice(0, 7), -11)}-01`, to: today });
  const txs = useMemo(() => inRange(data.transactions, range.from, range.to), [data.transactions, range]);
  const vol = useMemo(() => groupSeries(txs, 'month', range.from, range.to), [txs, range]);
  const growth = useMemo(() => vol.map((r) => ({ label: r.label, newUsers: data.users.filter((u) => monthKey(u.createdAt) === r.key).length, totalUsers: data.users.filter((u) => monthKey(u.createdAt) <= r.key).length })), [vol, data.users]);
  const t = totals(txs);
  const activeIds = new Set(txs.map((x) => x.userId));
  const activeAccounts = data.users.filter((u) => u.status === 'active').length;
  const exp = () => downloadCSV('platform-report.csv', vol.map((r, i) => ({ Month: monthLabel(r.key), 'New users': growth[i].newUsers, 'Total users': growth[i].totalUsers, 'Transaction records': r.count, 'Recorded income': r.income, 'Recorded expenses': r.expense }))) ? toast.success('Aggregate report exported') : toast.error('No data');
  return (
    <>
      <PageHeader title="Platform reports" subtitle={RECORDS_NOTE}><button className="btn-ghost" onClick={exp}><Download className="h-4 w-4" />Export CSV</button></PageHeader>
      <div className="card mb-4 flex flex-wrap items-end gap-3">
        <label><span className="label">From</span><input type="date" className="input" value={range.from} max={range.to} onChange={(e) => setRange({ ...range, from: e.target.value })} /></label>
        <label><span className="label">To</span><input type="date" className="input" value={range.to} min={range.from} max={today} onChange={(e) => setRange({ ...range, to: e.target.value })} /></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Users with records in range" value={`${activeIds.size} of ${data.users.length}`} sub="Distinct users who recorded a transaction" icon={Users} />
        <StatCard label="Active accounts" value={activeAccounts} sub={`${data.users.length - activeAccounts} inactive`} icon={UserCheck} tone="green" />
        <StatCard label="Transaction records" value={txs.length} sub={`${fmt(t.income)} income · ${fmt(t.expense)} expenses recorded`} icon={ReceiptText} tone="amber" />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card" aria-labelledby="p1"><h2 id="p1" className="mb-4 font-bold">User growth</h2><LineSeries money={false} data={growth} series={[{ key: 'totalUsers', name: 'Total users', color: '#0e7490' }, { key: 'newUsers', name: 'New users', color: '#f59e0b' }]} /></section>
        <section className="card" aria-labelledby="p2"><h2 id="p2" className="mb-4 font-bold">Transaction volume (records)</h2><BarSeries money={false} data={vol} series={[{ key: 'count', name: 'Records', color: '#6366f1' }]} /></section>
        <section className="card lg:col-span-2" aria-labelledby="p3"><h2 id="p3" className="mb-4 font-bold">Recorded income vs expenses</h2><BarSeries data={vol} series={INCOME_EXPENSE} /></section>
      </div>
    </>
  );
}
