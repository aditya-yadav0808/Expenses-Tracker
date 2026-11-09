const COLORS = ['bg-brand-700', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-violet-600', 'bg-sky-600'];
export default function Avatar({ name = '?', size = 'h-9 w-9 text-sm' }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  return <span aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${COLORS[name.length % COLORS.length]} ${size}`}>{initials}</span>;
}
