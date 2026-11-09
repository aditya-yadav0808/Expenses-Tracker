import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowUpDown, Download, Eye, Pencil, Plus, Receipt, Trash2 } from 'lucide-react';
import { useUserData } from '../../hooks/useUserData';
import { useFormat } from '../../hooks/useFormat';
import { usePagination } from '../../hooks/usePagination';
import { useAppData } from '../../context/AppDataContext';
import { useToast } from '../../components/common/Toast';
import { downloadCSV } from '../../utils/csv';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import CategoryBadge from '../../components/common/CategoryBadge';

export default function Transactions() {
  const { transactions, categories, getCat } = useUserData();
  const { act } = useAppData();
  const { fmt, date } = useFormat();
  const toast = useToast(); const nav = useNavigate();
  const [sp] = useSearchParams();
  const [f, setF] = useState({ q: sp.get('q') || '', type: '', cat: '', from: '', to: '' });
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' });
  const [view, setView] = useState(null); const [del, setDel] = useState(null);
  useEffect(() => setF((x) => ({ ...x, q: sp.get('q') || '' })), [sp]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const rows = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    const r = transactions.filter((t) => (!f.type || t.type === f.type) && (!f.cat || t.categoryId === f.cat) && (!f.from || t.date >= f.from) && (!f.to || t.date <= f.to)
      && (!q || `${t.description} ${t.notes || ''} ${getCat(t.categoryId).name} ${t.paymentMethod} ${t.amount}`.toLowerCase().includes(q)));
    return r.sort((a, b) => { const c = sort.key === 'amount' ? a.amount - b.amount : a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt); return sort.dir === 'asc' ? c : -c; });
  }, [transactions, f, sort, getCat]);
  const pg = usePagination(rows, 10);
  useEffect(() => pg.setPage(1), [f]); // eslint-disable-line
  const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }));
  const hasFilter = Object.values(f).some(Boolean);
  const exportCSV = () => downloadCSV('transactions.csv', rows.map((t) => ({ Date: t.date, Type: t.type, Category: getCat(t.categoryId).name, Amount: t.amount, 'Payment method': t.paymentMethod, Description: t.description, Notes: t.notes || '' }))) ? toast.success(`Exported ${rows.length} transactions`) : toast.error('Nothing to export');
  const SortBtn = ({ k, children }) => <button className="inline-flex items-center gap-1 font-semibold hover:text-slate-900 dark:hover:text-white" onClick={() => toggleSort(k)} aria-label={`Sort by ${k}`}>{children}<ArrowUpDown className="h-3 w-3" /></button>;

  return (
    <>
      <PageHeader title="Transactions" subtitle="Everything you have recorded, with search, filters and export.">
        <button className="btn-ghost" onClick={exportCSV}><Download className="h-4 w-4" />Export CSV</button>
        <Link to="/transactions/new" className="btn-primary"><Plus className="h-4 w-4" />Add transaction</Link>
      </PageHeader>
      <div className="card mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <input className="input lg:col-span-2" type="search" placeholder="Search description, category, amount…" aria-label="Search transactions" value={f.q} onChange={set('q')} />
        <select className="input" aria-label="Filter by type" value={f.type} onChange={set('type')}><option value="">All types</option><option value="income">Income</option><option value="expense">Expense</option></select>
        <select className="input" aria-label="Filter by category" value={f.cat} onChange={set('cat')}><option value="">All categories</option>{[...new Map(transactions.map((t) => [t.categoryId, getCat(t.categoryId)])).entries()].map(([id, c]) => <option key={id} value={id}>{c.name}</option>)}</select>
        <input className="input" type="date" aria-label="From date" value={f.from} onChange={set('from')} />
        <input className="input" type="date" aria-label="To date" value={f.to} onChange={set('to')} />
        {hasFilter && <button className="btn-ghost btn-sm sm:col-span-2 lg:col-span-6 sm:justify-self-start" onClick={() => setF({ q: '', type: '', cat: '', from: '', to: '' })}>Clear filters</button>}
      </div>
      <div className="card overflow-hidden !p-0">
        {pg.total === 0 ? <EmptyState icon={Receipt} title={hasFilter ? 'No matching transactions' : 'No transactions yet'} text={hasFilter ? 'Try adjusting or clearing your filters.' : 'Record your first income or expense.'} action={!hasFilter && <Link to="/transactions/new" className="btn-primary btn-sm">Add transaction</Link>} /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="bg-slate-50 dark:bg-slate-800/50"><tr><th className="th" scope="col"><SortBtn k="date">Date</SortBtn></th><th className="th" scope="col">Description</th><th className="th" scope="col">Category</th><th className="th" scope="col">Method</th><th className="th text-right" scope="col"><SortBtn k="amount">Amount</SortBtn></th><th className="th text-right" scope="col">Actions</th></tr></thead>
              <tbody>{pg.slice.map((t) => (
                <tr key={t.id} className="tr hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="td whitespace-nowrap">{date(t.date)}</td>
                  <td className="td max-w-[240px] truncate">{t.description}{t.recurringId && <span className="badge-slate ml-2">Recurring</span>}</td>
                  <td className="td"><CategoryBadge cat={getCat(t.categoryId)} /></td>
                  <td className="td text-slate-500">{t.paymentMethod}</td>
                  <td className={`td text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>{t.type === 'income' ? '+' : '−'}{fmt(t.amount)}</td>
                  <td className="td"><div className="flex justify-end gap-1">
                    <button className="icon-btn" aria-label={`View ${t.description}`} onClick={() => setView(t)}><Eye className="h-4 w-4" /></button>
                    <button className="icon-btn" aria-label={`Edit ${t.description}`} onClick={() => nav(`/transactions/${t.id}/edit`)}><Pencil className="h-4 w-4" /></button>
                    <button className="icon-btn hover:!text-rose-600" aria-label={`Delete ${t.description}`} onClick={() => setDel(t)}><Trash2 className="h-4 w-4" /></button>
                  </div></td>
                </tr>))}</tbody>
            </table>
          </div>)}
        <Pagination {...pg} onChange={pg.setPage} />
      </div>

      <Modal open={!!view} title="Transaction details" onClose={() => setView(null)}>
        {view && <dl className="grid grid-cols-3 gap-y-3 text-sm">{[['Type', view.type === 'income' ? 'Income' : 'Expense'], ['Amount', fmt(view.amount)], ['Category', getCat(view.categoryId).name], ['Date', date(view.date)], ['Payment method', view.paymentMethod], ['Description', view.description], ['Notes', view.notes || '—'], ['Source', view.recurringId ? `Recurring (due ${date(view.dueDate)})` : 'Entered manually']].map(([k, v]) => <div key={k} className="contents"><dt className="text-slate-500">{k}</dt><dd className="col-span-2 font-medium">{v}</dd></div>)}</dl>}
      </Modal>
      <ConfirmDialog open={!!del} message={`Delete “${del?.description}” (${del ? fmt(del.amount) : ''})? This cannot be undone.`} onCancel={() => setDel(null)} onConfirm={() => { act.deleteTransaction(del.id); setDel(null); toast.success('Transaction deleted'); }} />
    </>
  );
}
