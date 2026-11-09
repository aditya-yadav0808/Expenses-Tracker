const TONES = { brand: 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-100', green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', red: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300', amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' };
export default function StatCard({ label, value, sub, icon: Icon, tone = 'brand' }) {
  return (
    <div className="card flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1 truncate text-2xl font-extrabold">{value}</p>
        {sub && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
      </div>
      {Icon && <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONES[tone]}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>}
    </div>
  );
}
