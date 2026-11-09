import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, total, size, onChange }) {
  if (total <= size) return total ? <p className="px-4 py-3 text-xs text-slate-500">{total} record(s)</p> : null;
  const from = (page - 1) * size + 1; const to = Math.min(page * size, total);
  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-sm dark:border-slate-800">
      <p className="text-xs text-slate-500">Showing {from}–{to} of {total}</p>
      <div className="flex items-center gap-1">
        <button className="icon-btn" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
        <span className="px-2 text-xs">Page {page} of {pages}</span>
        <button className="icon-btn" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
