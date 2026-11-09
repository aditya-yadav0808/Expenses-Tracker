import { useEffect, useMemo, useState } from 'react';
import { ArrowUpDown, Download, Eye, Lock, Receipt } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useFormat } from '../../hooks/useFormat';
import { usePagination } from '../../hooks/usePagination';
import { useToast } from '../../components/common/Toast';
import { downloadCSV } from '../../utils/csv';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import CategoryBadge from '../../components/common/CategoryBadge';

const FALLBACK = { name: 'Uncategorized', color: '#94a3b8', icon: 'Tag' };
export default function AdminTransactions() {
  const { data } = useAppData(); const { fmt, date } = useFormat(); const toast = useToast();
  const [f, setF] = useState({ q: '', user: '', type: '', cat: '', from: '', to: '' });
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' }); const [view, setView] = useState(null);
  const cats = useMemo(() => new Map(data.categories.map((c) => [c.id, c])), [data.categories]);
  const users = useMemo(() => new Map(data.users.map((u) => [u.id, u])), [data.users]);
  const cat = (id) => cats.get(id) || FALLBACK;
  const rows = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return data.transactions.filter((t) => (!f.user || t.userId === f.user) && (!f.type || t.type === f.type) && (!f.cat || t.categoryId === f.cat) && (!f.from || t.date >= f.from) && (!f.to || t.date <= f.to) && (!q || `${t.description} ${users.get(t.userId)?.name || ''}`.toLowerCase().includes(q)))
      .sort((a, b) => { const c = sort.key === 'amount' ? a.amount - b.amount : a.date.localeCompare(b.date); return sort.dir === 'asc' ? c : -c; });
  }, [data.transactions, f, sort, users]);
  const pg = usePagination(rows, 10);
  useEffect(() => pg.setPage(1), [f]); // eslint-disable-line
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const tog = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));
  const exp = () => downloadCSV('platform-transactions.csv', rows.map((t) => ({ 'Record ID': t.id, 'User ID': t.userId, User: users.get(t.userId)?.name || 'Deleted user', Date: t.date, Type: t.type, Category: cat(t.categoryId).name, Amount: t.amount, 'Payment method': t.paymentMethod }))) ? toast.success(`Exported ${rows.length} records`) : toast.error('Nothing to export');
  return (
    <>
      <PageHeader title="Transaction monitoring" subtitle="Read-only view of recorded transactions across all users."><button className="btn-ghost" onClick={exp}><Download className="h-4 w-4" />Export CSV</button></PageHeader>
      <p className="mb-4 flex items-center gap-2 rounded-xl bg-slate-100 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"><Lock className="h-4 w-4 shrink-0" aria-hidden="true" />Admins cannot edit personal transactions. Any exceptional edit would need an explicit permission and an audit trail on the backend.</p>
      <div className="card mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <input className="input lg:col-span-2" type="search" placeholder="Search description or user" aria-label="Search" value={f.q} onChange={set('q')} />
        <select className="input" aria-label="User" value={f.user} onChange={set('user')}><option value="">All users</option>{data.users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select>
        <select className="input" aria-label="Type" value={f.type} onChange={set('type')}><option value="">All types</option><option value="income">Income</option><option value="expense">Expense</option></select>
        <select className="input" aria-label="Category" value={f.cat} onChange={set('cat')}><option value="">All categories</option>{data.categories.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}</select>
        <div className="grid grid-cols-2 gap-2"><input className="input" type="date" aria-label="From" value={f.from} onChange={set('from')} /><input className="input" type="date" aria-label="To" value={f.to} onChange={set('to')} /></div>
      </div>
      <div className="card overflow-hidden !p-0">
        {pg.total === 0 ? <EmptyState icon={Receipt} title="No records match" /> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[760px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50"><tr><th className="th" scope="col"><button className="inline-flex items-center gap-1" onClick={() => tog('date')}>Date<ArrowUpDown className="h-3 w-3" /></button></th><th className="th" scope="col">User</th><th className="th" scope="col">Description</th><th className="th" scope="col">Category</th><th className="th text-right" scope="col"><button className="inline-flex items-center gap-1" onClick={() => tog('amount')}>Amount<ArrowUpDown className="h-3 w-3" /></button></th><th className="th" scope="col"><span className="sr-only">View</span></th></tr></thead>
            <tbody>{pg.slice.map((t) => <tr key={t.id} className="tr"><td className="td whitespace-nowrap">{date(t.date)}</td><td className="td">{users.get(t.userId)?.name || 'Deleted user'}</td><td className="td max-w-[220px] truncate">{t.description}</td><td className="td"><CategoryBadge cat={cat(t.categoryId)} /></td><td className={`td text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>{t.type === 'income' ? '+' : '−'}{fmt(t.amount)}</td><td className="td"><button className="icon-btn" aria-label={`View ${t.description}`} onClick={() => setView(t)}><Eye className="h-4 w-4" /></button></td></tr>)}</tbody></table></div>)}
        <Pagination {...pg} onChange={pg.setPage} />
      </div>
      <Modal open={!!view} title="Record details (read-only)" onClose={() => setView(null)}>
        {view && <dl className="grid grid-cols-3 gap-y-3 text-sm">{[['Record ID', view.id], ['User', users.get(view.userId)?.name || 'Deleted user'], ['Type', view.type], ['Amount', fmt(view.amount)], ['Category', cat(view.categoryId).name], ['Date', date(view.date)], ['Payment method', view.paymentMethod], ['Description', view.description], ['Notes', view.notes || '—']].map(([k, v]) => <div key={k} className="contents"><dt className="text-slate-500">{k}</dt><dd className="col-span-2 break-all font-medium">{v}</dd></div>)}</dl>}
      </Modal>
    </>
  );
}
