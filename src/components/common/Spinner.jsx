export default function Spinner({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center gap-3 text-sm text-slate-500" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" aria-hidden="true" />{label}
    </div>
  );
}
