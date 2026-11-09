import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownRight, ArrowUpRight, Plus, Percent, Scale, CalendarClock } from 'lucide-react';
import { useUserData } from '../../hooks/useUserData';
import { useFormat } from '../../hooks/useFormat';
import { budgetUsage, categoryBreakdown, inRange, lastNMonthsSeries, periodRange, totals, upcomingRecurring } from '../../utils/calculations';
import { todayISO } from '../../utils/dateUtils';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import ProgressBar from '../../components/common/ProgressBar';
import EmptyState from '../../components/common/EmptyState';
import Segmented from '../../components/common/Segmented';
import CategoryBadge from '../../components/common/CategoryBadge';
import BarSeries from '../../components/charts/BarSeries';
import CategoryPie from '../../components/charts/CategoryPie';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { transactions, budgets, goals, recurring, getCat } = useUserData();
  const { fmt, date } = useFormat();
  const [period, setPeriod] = useState('month');
  const today = todayISO(); const mk = today.slice(0, 7);

  const all = totals(transactions);
  const [from, to] = periodRange(period, today);
  const pt = totals(inRange(transactions, from, to));
  const series = lastNMonthsSeries(transactions, 6, today);
  const pie = categoryBreakdown(inRange(transactions, `${mk}-01`, today), getCat);
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  const monthBudgets = budgets.filter((b) => b.month === mk).sort((a, b) => (a.categoryId ? 1 : 0) - (b.categoryId ? 1 : 0));
  const upcoming = upcomingRecurring(recurring, transactions, today).slice(0, 5);
  const goalsSaved = goals.reduce((s, g) => s + g.saved, 0);

  return (
    <>
      <PageHeader title={`Hello, ${user.name.split(' ')[0]}`} subtitle="Your recorded income and spending at a glance.">
        <Link to="/transactions/new?type=income" className="btn-ghost"><Plus className="h-4 w-4" />Add income</Link>
        <Link to="/transactions/new?type=expense" className="btn-primary"><Plus className="h-4 w-4" />Add expense</Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Net cash flow" value={fmt(all.net)} sub="Income − expenses (not a bank balance)" icon={Scale} tone={all.net >= 0 ? 'brand' : 'red'} />
        <StatCard label="Total income" value={fmt(all.income)} sub="Recorded income" icon={ArrowUpRight} tone="green" />
        <StatCard label="Total expenses" value={fmt(all.expense)} sub="Recorded expenses" icon={ArrowDownRight} tone="red" />
        <StatCard label="Savings rate" value={`${all.savingsRate.toFixed(1)}%`} sub={`${fmt(goalsSaved)} set aside in savings goals`} icon={Percent} tone="amber" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2" aria-labelledby="ie">
          <h2 id="ie" className="mb-4 font-bold">Income vs expenses, last 6 months</h2>
          {transactions.length ? <BarSeries data={series} /> : <EmptyState title="No transactions yet" text="Add your first transaction to see trends." />}
        </section>
        <section className="card" aria-labelledby="per">
          <div className="mb-4 flex items-center justify-between"><h2 id="per" className="font-bold">Summary</h2>
            <Segmented label="Period" value={period} onChange={setPeriod} options={[{ value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }, { value: 'year', label: 'Year' }]} /></div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Income</dt><dd className="font-semibold text-emerald-600">{fmt(pt.income)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Expenses</dt><dd className="font-semibold text-rose-600">{fmt(pt.expense)}</dd></div>
            <div className="flex justify-between border-t border-slate-100 pt-3 dark:border-slate-800"><dt className="text-slate-500">Net cash flow</dt><dd className="font-bold">{fmt(pt.net)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Savings rate</dt><dd className="font-bold">{pt.savingsRate.toFixed(1)}%</dd></div>
          </dl>
        </section>

        <section className="card" aria-labelledby="pie">
          <h2 id="pie" className="mb-4 font-bold">Spending by category (this month)</h2>
          {pie.length ? <CategoryPie data={pie} /> : <EmptyState title="No spending this month" />}
        </section>
        <section className="card" aria-labelledby="bp">
          <div className="mb-4 flex items-center justify-between"><h2 id="bp" className="font-bold">Monthly budget</h2><Link to="/budgets" className="text-xs font-semibold text-brand-700 hover:underline dark:text-brand-400">Manage</Link></div>
          {monthBudgets.length ? (
            <ul className="space-y-4">{monthBudgets.slice(0, 4).map((b) => { const u = budgetUsage(b, transactions); return (
              <li key={b.id}>
                <div className="mb-1 flex justify-between text-sm"><span className="font-medium">{b.categoryId ? getCat(b.categoryId).name : 'Overall'}</span><span className={u.status === 'over' ? 'font-semibold text-rose-600' : 'text-slate-500'}>{fmt(u.spent)} / {fmt(b.limit)}</span></div>
                <ProgressBar pct={u.pct} status={u.status} label={`${b.categoryId ? getCat(b.categoryId).name : 'Overall'} budget used`} />
              </li>); })}</ul>
          ) : <EmptyState title="No budget for this month" action={<Link to="/budgets" className="btn-primary btn-sm">Create budget</Link>} />}
        </section>
        <section className="card" aria-labelledby="up">
          <div className="mb-4 flex items-center justify-between"><h2 id="up" className="font-bold">Upcoming recurring</h2><Link to="/recurring-transactions" className="text-xs font-semibold text-brand-700 hover:underline dark:text-brand-400">View all</Link></div>
          {upcoming.length ? (
            <ul className="space-y-3">{upcoming.map(({ rec, date: d, due }) => (
              <li key={rec.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-slate-400" aria-hidden="true" /><span><span className="font-medium">{rec.description}</span><span className="block text-xs text-slate-500">{due ? <span className="font-semibold text-amber-600">Due since {date(d)}</span> : `Scheduled ${date(d)}`}</span></span></span>
                <span className={rec.type === 'income' ? 'font-semibold text-emerald-600' : 'font-semibold'}>{fmt(rec.amount)}</span>
              </li>))}</ul>
          ) : <EmptyState title="Nothing scheduled" />}
        </section>

        <section className="card lg:col-span-3" aria-labelledby="rt">
          <div className="mb-3 flex items-center justify-between"><h2 id="rt" className="font-bold">Recent transactions</h2><Link to="/transactions" className="text-xs font-semibold text-brand-700 hover:underline dark:text-brand-400">View all</Link></div>
          {recent.length ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">{recent.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0"><p className="truncate text-sm font-medium">{t.description}</p><div className="mt-1 flex items-center gap-3 text-xs text-slate-500"><CategoryBadge cat={getCat(t.categoryId)} /><span>{date(t.date)}</span></div></div>
                <span className={`shrink-0 text-sm font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>{t.type === 'income' ? '+' : '−'}{fmt(t.amount)}</span>
              </li>))}</ul>
          ) : <EmptyState title="No transactions yet" action={<Link to="/transactions/new" className="btn-primary btn-sm">Add transaction</Link>} />}
        </section>
      </div>
    </>
  );
}
