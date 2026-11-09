import { useEffect, useMemo, useState } from 'react';
import { ScrollText, TriangleAlert } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useFormat } from '../../hooks/useFormat';
import { usePagination } from '../../hooks/usePagination';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';

export default function AuditLogs() {
  const { data } = useAppData(); const { dateTime } = useFormat();
  const [f, setF] = useState({ q: '', action: '' });
  const actions = [...new Set(data.audit.map((a) => a.action))];
  const rows = useMemo(() => { const q = f.q.trim().toLowerCase(); return data.audit.filter((a) => (!f.action || a.action === f.action) && (!q || `${a.actor} ${a.target} ${a.details}`.toLowerCase().includes(q))); }, [data.audit, f]);
  const pg = usePagination(rows, 12);
  useEffect(() => pg.setPage(1), [f]); // eslint-disable-line
  return (
    <>
      <PageHeader title="Audit logs" subtitle="Administrative events recorded in this browser." />
      <p className="mb-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950 dark:text-amber-200"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />These entries sit in LocalStorage and can be edited or cleared by anyone with browser access. Persistent, tamper-resistant audit logging requires server-side storage with append-only guarantees.</p>
      <div className="card mb-4 grid gap-3 sm:grid-cols-2">
        <input className="input" type="search" placeholder="Search actor, target or details" aria-label="Search audit log" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} />
        <select className="input" aria-label="Filter by action" value={f.action} onChange={(e) => setF({ ...f, action: e.target.value })}><option value="">All actions</option>{actions.map((a) => <option key={a} value={a}>{a.replaceAll('_', ' ').toLowerCase()}</option>)}</select>
      </div>
      <div className="card overflow-hidden !p-0">
        {pg.total === 0 ? <EmptyState icon={ScrollText} title="No audit entries" /> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[680px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50"><tr><th className="th" scope="col">Timestamp</th><th className="th" scope="col">Action</th><th className="th" scope="col">Actor</th><th className="th" scope="col">Target</th><th className="th" scope="col">Details</th></tr></thead>
            <tbody>{pg.slice.map((a) => <tr key={a.id} className="tr"><td className="td whitespace-nowrap">{dateTime(a.timestamp)}</td><td className="td"><span className="badge-brand">{a.action.replaceAll('_', ' ').toLowerCase()}</span></td><td className="td">{a.actor}</td><td className="td font-mono text-xs">{a.target}</td><td className="td text-slate-500">{a.details || '—'}</td></tr>)}</tbody></table></div>)}
        <Pagination {...pg} onChange={pg.setPage} />
      </div>
    </>
  );
}
