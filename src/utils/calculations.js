// Pure financial calculations. Everything shown in charts/cards is derived here from raw transactions.
import { addDays, addMonths, daysBetween, formatDate, monthKey, monthLabel, startOfWeek, addMonthKey, todayISO } from './dateUtils';

const sum = (a) => a.reduce((s, t) => s + t.amount, 0);

/** Net cash flow = income − expenses (NOT a bank balance). Savings rate = net / income when income > 0. */
export const totals = (txs) => {
  const income = sum(txs.filter((t) => t.type === 'income'));
  const expense = sum(txs.filter((t) => t.type === 'expense'));
  const net = income - expense;
  return { income, expense, net, savingsRate: income > 0 ? (net / income) * 100 : 0 };
};
export const inRange = (txs, from, to) => txs.filter((t) => (!from || t.date >= from) && (!to || t.date <= to));
export const periodRange = (period, today = todayISO()) =>
  period === 'week' ? [startOfWeek(today), today] : period === 'year' ? [`${today.slice(0, 4)}-01-01`, today] : [`${today.slice(0, 7)}-01`, today];

const keyFn = { day: (d) => d, week: startOfWeek, month: monthKey, year: (d) => d.slice(0, 4) };
const labelFn = (g, k) => (g === 'month' ? monthLabel(k) : g === 'year' ? k : formatDate(k, 'DD MMM YYYY').slice(0, 6));

/** Groups transactions into day / week / month / year buckets. Month buckets are zero-filled across [from,to]. */
export function groupSeries(txs, g, from, to) {
  const map = new Map();
  if (g === 'month' && from && to) for (let k = monthKey(from); k <= monthKey(to); k = addMonthKey(k, 1)) map.set(k, { key: k, income: 0, expense: 0, count: 0 });
  txs.forEach((t) => {
    const k = keyFn[g](t.date);
    const row = map.get(k) || { key: k, income: 0, expense: 0, count: 0 };
    row[t.type] += t.amount; row.count += 1; map.set(k, row);
  });
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key))
    .map((r) => ({ ...r, label: labelFn(g, r.key), net: r.income - r.expense, savingsRate: r.income > 0 ? ((r.income - r.expense) / r.income) * 100 : 0 }));
}
export const lastNMonthsSeries = (txs, n = 6, today = todayISO()) => {
  const from = `${addMonthKey(today.slice(0, 7), -(n - 1))}-01`;
  return groupSeries(inRange(txs, from, today), 'month', from, today);
};
export const categoryBreakdown = (txs, getCat, type = 'expense') => {
  const m = new Map();
  txs.filter((t) => t.type === type).forEach((t) => m.set(t.categoryId, (m.get(t.categoryId) || 0) + t.amount));
  return [...m.entries()].map(([id, value]) => ({ id, name: getCat(id).name, color: getCat(id).color, value })).sort((a, b) => b.value - a.value);
};

/** Budget remaining = limit − eligible recorded expenses in that month (and category, if category-specific). */
export const budgetUsage = (b, txs) => {
  const spent = sum(txs.filter((t) => t.type === 'expense' && monthKey(t.date) === b.month && (!b.categoryId || t.categoryId === b.categoryId)));
  const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
  return { spent, remaining: b.limit - spent, pct, status: spent > b.limit ? 'over' : pct >= 80 ? 'warn' : 'ok' };
};

// ---- Recurring transactions -------------------------------------------------
/** i-th occurrence computed from the start date (avoids month-end drift). */
export const occurrenceDate = (r, i) => (r.frequency === 'weekly' ? addDays(r.startDate, 7 * i) : r.frequency === 'yearly' ? addMonths(r.startDate, 12 * i) : addMonths(r.startDate, i));
/** Occurrence dates up to today that have NOT yet been recorded as a real transaction. */
export const dueOccurrences = (r, txs, today = todayISO()) => {
  const done = new Set(txs.filter((t) => t.recurringId === r.id).map((t) => t.dueDate));
  const out = [];
  for (let i = 0; i < 1000; i++) {
    const d = occurrenceDate(r, i);
    if (d > today || (r.endDate && d > r.endDate)) break;
    if (!done.has(d)) out.push(d);
  }
  return out;
};
export const nextOccurrence = (r, today = todayISO()) => {
  for (let i = 0; i < 1000; i++) {
    const d = occurrenceDate(r, i);
    if (r.endDate && d > r.endDate) return null;
    if (d > today) return d;
  }
  return null;
};
export const effectiveStatus = (r, txs, today = todayISO()) =>
  r.status === 'paused' ? 'paused' : !nextOccurrence(r, today) && !dueOccurrences(r, txs, today).length ? 'completed' : 'active';
/** Scheduled items (not yet transactions): due ones first, then the next future date per active rule. */
export const upcomingRecurring = (recurring, txs, today = todayISO()) =>
  recurring.filter((r) => effectiveStatus(r, txs, today) === 'active')
    .map((rec) => { const due = dueOccurrences(rec, txs, today); const date = due[0] || nextOccurrence(rec, today); return { rec, date, due: !!due.length, dueCount: due.length }; })
    .filter((x) => x.date).sort((a, b) => a.date.localeCompare(b.date));

// ---- Notifications (derived, never stored) ---------------------------------
export function deriveNotifications({ txs, budgets, goals, recurring, getCat, fmt, today = todayISO(), prefs = {} }) {
  const out = [];
  const mk = today.slice(0, 7);
  if (prefs.notifyBudget !== false) {
    budgets.filter((b) => b.month === mk).forEach((b) => {
      const u = budgetUsage(b, txs); const name = b.categoryId ? getCat(b.categoryId).name : 'Overall';
      if (u.status === 'over') out.push({ id: `bud-${b.id}-over`, type: 'budget', severity: 'danger', title: `${name} budget exceeded`, message: `You have spent ${fmt(u.spent)} against a limit of ${fmt(b.limit)} (${fmt(-u.remaining)} over).`, link: '/budgets' });
      else if (u.status === 'warn') out.push({ id: `bud-${b.id}-warn`, type: 'budget', severity: 'warning', title: `${name} budget at ${Math.round(u.pct)}%`, message: `Only ${fmt(u.remaining)} left of ${fmt(b.limit)} this month.`, link: '/budgets' });
    });
  }
  if (prefs.notifyRecurring !== false) {
    upcomingRecurring(recurring, txs, today).forEach(({ rec, date, due, dueCount }) => {
      if (due) out.push({ id: `rec-${rec.id}-due-${date}`, type: 'recurring', severity: 'warning', title: `${rec.description} is due`, message: `${dueCount} scheduled occurrence(s) not yet recorded (since ${date}). Record them from Recurring.`, link: '/recurring-transactions' });
      else if (daysBetween(today, date) <= 7) out.push({ id: `rec-${rec.id}-up-${date}`, type: 'recurring', severity: 'info', title: `Upcoming: ${rec.description}`, message: `${fmt(rec.amount)} scheduled for ${date} (${daysBetween(today, date)} day(s) away).`, link: '/recurring-transactions' });
    });
  }
  if (prefs.notifyGoals !== false) {
    goals.filter((g) => g.saved < g.target && g.deadline).forEach((g) => {
      const d = daysBetween(today, g.deadline);
      if (d < 0) out.push({ id: `goal-${g.id}-late`, type: 'goal', severity: 'danger', title: `${g.name} is past its deadline`, message: `${fmt(g.target - g.saved)} still needed.`, link: '/savings-goals' });
      else if (d <= 14) out.push({ id: `goal-${g.id}-soon`, type: 'goal', severity: 'warning', title: `${g.name} deadline in ${d} day(s)`, message: `${fmt(g.target - g.saved)} still needed.`, link: '/savings-goals' });
    });
  }
  const rank = { danger: 0, warning: 1, info: 2 };
  return out.sort((a, b) => rank[a.severity] - rank[b.severity]);
}
