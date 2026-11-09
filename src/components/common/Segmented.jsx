export default function Segmented({ value, onChange, options, label }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${value === o.value ? 'bg-white shadow-sm dark:bg-slate-700' : 'text-slate-500'}`}>{o.label}</button>
      ))}
    </div>
  );
}
