export default function ProgressBar({ pct, status = 'ok', label }) {
  const color = status === 'over' ? 'bg-rose-500' : status === 'warn' ? 'bg-amber-500' : status === 'done' ? 'bg-emerald-500' : 'bg-brand-600';
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, Math.round(pct))} aria-label={label}>
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}
