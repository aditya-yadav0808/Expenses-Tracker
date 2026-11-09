import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, UserCog, UserX, UserCheck, Users } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { useFormat } from '../../hooks/useFormat';
import { usePagination } from '../../hooks/usePagination';
import { useToast } from '../../components/common/Toast';
import { totals } from '../../utils/calculations';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Avatar from '../../components/common/Avatar';

export default function AdminUsers() {
  const { data, act } = useAppData(); const { user: me } = useAuth(); const { date, dateTime, fmt } = useFormat(); const toast = useToast();
  const [sp] = useSearchParams();
  const [f, setF] = useState({ q: sp.get('q') || '', role: '', status: '' });
  const [view, setView] = useState(null); const [confirm, setConfirm] = useState(null);
  useEffect(() => setF((x) => ({ ...x, q: sp.get('q') || '' })), [sp]);
  const rows = useMemo(() => { const q = f.q.trim().toLowerCase(); return data.users.filter((u) => (!f.role || u.role === f.role) && (!f.status || u.status === f.status) && (!q || `${u.name} ${u.email}`.toLowerCase().includes(q))).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }, [data.users, f]);
  const pg = usePagination(rows, 8);
  useEffect(() => pg.setPage(1), [f]); // eslint-disable-line
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const run = () => {
    const { u, kind } = confirm;
    if (kind === 'status') { const next = u.status === 'active' ? 'inactive' : 'active'; act.updateUser(u.id, { status: next }); act.audit(me, next === 'active' ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', u.id, `${u.email}`); toast.success(`${u.name} is now ${next}`); }
    else { const next = u.role === 'admin' ? 'user' : 'admin'; act.updateUser(u.id, { role: next }); act.audit(me, 'ROLE_CHANGED', u.id, `${u.email}: ${u.role} → ${next}`); toast.success(`${u.name} is now ${next === 'admin' ? 'an admin' : 'a regular user'}`); }
    setConfirm(null);
  };
  const stats = (id) => { const tx = data.transactions.filter((t) => t.userId === id); return { count: tx.length, ...totals(tx) }; };
  return (
    <>
      <PageHeader title="User management" subtitle="Account details only. Passwords and credentials are never shown." />
      <div className="card mb-4 grid gap-3 sm:grid-cols-3">
        <input className="input" type="search" placeholder="Search name or email" aria-label="Search users" value={f.q} onChange={set('q')} />
        <select className="input" aria-label="Filter by role" value={f.role} onChange={set('role')}><option value="">All roles</option><option value="user">User</option><option value="admin">Admin</option></select>
        <select className="input" aria-label="Filter by status" value={f.status} onChange={set('status')}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
      </div>
      <div className="card overflow-hidden !p-0">
        {pg.total === 0 ? <EmptyState icon={Users} title="No users match" text="Adjust the search or filters." /> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[720px]">
            <thead className="bg-slate-50 dark:bg-slate-800/50"><tr><th className="th" scope="col">User</th><th className="th" scope="col">Role</th><th className="th" scope="col">Status</th><th className="th" scope="col">Joined</th><th className="th" scope="col">Last login</th><th className="th text-right" scope="col">Actions</th></tr></thead>
            <tbody>{pg.slice.map((u) => { const self = u.id === me.id; return (
              <tr key={u.id} className="tr">
                <td className="td"><div className="flex items-center gap-3"><Avatar name={u.name} /><div><p className="font-semibold">{u.name}{self && <span className="badge-slate ml-2">You</span>}</p><p className="text-xs text-slate-500">{u.email}</p></div></div></td>
                <td className="td capitalize">{u.role}</td>
                <td className="td"><span className={u.status === 'active' ? 'badge-green' : 'badge-slate'}>{u.status}</span></td>
                <td className="td">{date(u.createdAt)}</td><td className="td">{date(u.lastLogin)}</td>
                <td className="td"><div className="flex justify-end gap-1">
                  <button className="icon-btn" aria-label={`View ${u.name}`} onClick={() => setView(u)}><Eye className="h-4 w-4" /></button>
                  <button className="icon-btn" disabled={self} title={self ? 'You cannot change your own role' : 'Change role'} aria-label={`Change role for ${u.name}`} onClick={() => setConfirm({ u, kind: 'role' })}><UserCog className="h-4 w-4" /></button>
                  <button className="icon-btn" disabled={self} title={self ? 'You cannot deactivate yourself' : u.status === 'active' ? 'Deactivate' : 'Activate'} aria-label={`${u.status === 'active' ? 'Deactivate' : 'Activate'} ${u.name}`} onClick={() => setConfirm({ u, kind: 'status' })}>{u.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}</button>
                </div></td>
              </tr>); })}</tbody></table></div>)}
        <Pagination {...pg} onChange={pg.setPage} />
      </div>
      <Modal open={!!view} title="User details" onClose={() => setView(null)}>
        {view && (() => { const s = stats(view.id); return <dl className="grid grid-cols-3 gap-y-3 text-sm">{[['Name', view.name], ['Email', view.email], ['Role', view.role], ['Status', view.status], ['Joined', date(view.createdAt)], ['Last login', dateTime(view.lastLogin)], ['Records', `${s.count} transaction(s)`], ['Recorded income', fmt(s.income)], ['Recorded expenses', fmt(s.expense)]].map(([k, v]) => <div key={k} className="contents"><dt className="text-slate-500">{k}</dt><dd className="col-span-2 font-medium break-all">{v}</dd></div>)}</dl>; })()}
      </Modal>
      <ConfirmDialog open={!!confirm} danger={confirm?.kind === 'status' && confirm?.u.status === 'active'} confirmText="Confirm" title={confirm?.kind === 'role' ? 'Change role?' : confirm?.u.status === 'active' ? 'Deactivate account?' : 'Activate account?'}
        message={confirm ? (confirm.kind === 'role' ? `Change ${confirm.u.name} from ${confirm.u.role} to ${confirm.u.role === 'admin' ? 'user' : 'admin'}? This is recorded in the audit log.` : confirm.u.status === 'active' ? `${confirm.u.name} will be signed out and unable to log in. Their data is kept.` : `${confirm.u.name} will be able to log in again.`) : ''}
        onCancel={() => setConfirm(null)} onConfirm={run} />
    </>
  );
}
