// Date helpers. Dates are stored as ISO strings ("YYYY-MM-DD") to avoid timezone drift.
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const pad = (n) => String(n).padStart(2, '0');
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseISO = (s) => { const [y, m, d] = s.slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
export const todayISO = () => toISO(new Date());
export const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return toISO(d); };
/** Adds months, clamping to the last day of the target month (31 Jan + 1 month = 28/29 Feb). */
export const addMonths = (s, n) => {
  const d = parseISO(s); const day = d.getDate();
  d.setDate(1); d.setMonth(d.getMonth() + n);
  d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
  return toISO(d);
};
export const monthKey = (s) => s.slice(0, 7);
export const addMonthKey = (k, n) => { const [y, m] = k.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
export const startOfWeek = (s) => { const d = parseISO(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return toISO(d); };
export const monthLabel = (k) => { const [y, m] = k.split('-'); return `${MONTHS[+m - 1]} ${y.slice(2)}`; };
export const daysBetween = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 864e5);
export const formatDate = (s, fmt = 'DD MMM YYYY') => {
  if (!s) return '—';
  const [y, m, d] = s.slice(0, 10).split('-');
  switch (fmt) {
    case 'DD/MM/YYYY': return `${d}/${m}/${y}`;
    case 'MM/DD/YYYY': return `${m}/${d}/${y}`;
    case 'YYYY-MM-DD': return `${y}-${m}-${d}`;
    default: return `${d} ${MONTHS[+m - 1]} ${y}`;
  }
};
export const formatDateTime = (iso, fmt) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${formatDate(toISO(d), fmt)}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};
