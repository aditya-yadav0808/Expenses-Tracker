import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useUserData } from '../../hooks/useUserData';
import { useFormat } from '../../hooks/useFormat';
import { useToast } from '../../components/common/Toast';
import { categoryBreakdown, groupSeries, inRange, totals } from '../../utils/calculations';
import { addDays, addMonthKey, todayISO } from '../../utils/dateUtils';
import { downloadCSV } from '../../utils/csv';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Segmented from '../../components/common/Segmented';
import EmptyState from '../../components/common/EmptyState';
import BarSeries from '../../components/charts/BarSeries';
import LineSeries from '../../components/charts/LineSeries';
import CategoryPie from '../../components/charts/CategoryPie';
import { Scale, ArrowUpRight, ArrowDownRight, Percent } from 'lucide-react';

const today = todayISO();
const PRESET = { day: () => addDays(today, -29), week: () => addDays(today, -83), month: () => `${addMonthKey(today.slice(0, 7), -11)}-01`, year: () => `${+today.slice(0, 4) - 4}-01-01` };
const GRAN = [{ value: 'day', label: 'Daily' }, { value: 'week', label: 'Weekly' }, { value: 'month', label: 'Monthly' }, { value: 'year', label: 'Yearly' }];
const delta = (a, b) => (b === 0 ? (a === 0 ? '0%' : 'new') : `${a >= b ? '+' : ''}${(((a - b) / b) * 100).toFixed(0)}%`);

export default function Reports() {
  const { transactions, getCat } = useUserData();
  const { fmt } = useFormat(); const toast = useToast();
  const [g, setG] = useState('month');
  const [range, setRange] = useState({ from: PRESET.month(), to: today });
  const changeG = (v) => { setG(v); setRange({ from: PRESET[v](), to: today }); };

  const txs = useMemo(() => inRange(transactions, range.from, range.to), [transactions, range]);
  const t = totals(txs);
  const series = useMemo(() => groupSeries(txs, g, range.from, range.to), [txs, g, range]);
  const pie = useMemo(() => categoryBreakdown(txs, getCat), [txs, getCat]);
  const mk = today.slice(0, 7); const pk = addMonthKey(mk, -1);
  const cur = totals(transactions.filter((x) => x.date.startsWith(mk))); const prev = totals(transactions.filter((x) => x.date.startsWith(pk)));
  const exportCSV = () => downloadCSV(`report-${g}.csv`, series.map((r) => ({ Period: r.label, Income: r.income, Expenses: r.expense, 'Net cash flow': r.net, 'Savings rate %': r.savingsRate.toFixed(1), Transactions: r.count }))) ? toast.success('Report exported') : toast.error('No data in this range');

  return (
    <>
      <PageHeader title="Reports & analytics" subtitle="Calculated live from your recorded transactions.">
        <Segmented label="Group by" value={g} onChange={changeG} options={GRAN} />
        <button className="btn-ghost" onClick={exportCSV}><Download className="h-4 w-4" />Export CSV</button>
      </PageHeader>
      <div className="card mb-4 flex flex-wrap items-end gap-3">
        <label><span className="label">From</span><input type="date" className="input" value={range.from} max={range.to} onChange={(e) => setRange({ ...range, from: e.target.value })} /></label>
        <label><span className="label">To</span><input type="date" className="input" value={range.to} min={range.from} max={today} onChange={(e) => setRange({ ...range, to: e.target.value })} /></label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Income" value={fmt(t.income)} icon={ArrowUpRight} tone="green" />
        <StatCard label="Expenses" value={fmt(t.expense)} icon={ArrowDownRight} tone="red" />
        <StatCard label="Net cash flow" value={fmt(t.net)} icon={Scale} tone={t.net >= 0 ? 'brand' : 'red'} />
        <StatCard label="Savings rate" value={`${t.savingsRate.toFixed(1)}%`} icon={Percent} tone="amber" />
      </div>
      {txs.length === 0 ? <div className="card mt-6"><EmptyState title="No transactions in this range" text="Widen the date range to see reports." /></div> : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="card" aria-labelledby="r1"><h2 id="r1" className="mb-4 font-bold">Income vs expenses</h2><BarSeries data={series} /></section>
          <section className="card" aria-labelledby="r2"><h2 id="r2" className="mb-4 font-bold">Net cash flow trend</h2><LineSeries data={series} series={[{ key: 'income', name: 'Income', color: '#16a34a' }, { key: 'expense', name: 'Expenses', color: '#e11d48' }, { key: 'net', name: 'Net', color: '#0e7490' }]} /></section>
          <section className="card" aria-labelledby="r3"><h2 id="r3" className="mb-4 font-bold">Spending by category</h2>{pie.length ? <CategoryPie data={pie} /> : <EmptyState title="No expenses in range" />}</section>
          <section className="card" aria-labelledby="r4">
            <h2 id="r4" className="mb-4 font-bold">This month vs last month</h2>
            <table className="w-full text-sm"><thead><tr><th className="th pl-0">Measure</th><th className="th text-right">Last month</th><th className="th text-right">This month</th><th className="th text-right">Change</th></tr></thead>
              <tbody>{[['Income', prev.income, cur.income], ['Expenses', prev.expense, cur.expense], ['Net cash flow', prev.net, cur.net]].map(([k, p, c]) => <tr key={k} className="tr"><td className="py-3">{k}</td><td className="py-3 text-right">{fmt(p)}</td><td className="py-3 text-right font-semibold">{fmt(c)}</td><td className="py-3 text-right">{delta(c, p)}</td></tr>)}
                <tr className="tr"><td className="py-3">Savings rate</td><td className="py-3 text-right">{prev.savingsRate.toFixed(1)}%</td><td className="py-3 text-right font-semibold">{cur.savingsRate.toFixed(1)}%</td><td className="py-3 text-right">{(cur.savingsRate - prev.savingsRate).toFixed(1)} pts</td></tr></tbody></table>
          </section>
        </div>)}
    </>
  );
}
