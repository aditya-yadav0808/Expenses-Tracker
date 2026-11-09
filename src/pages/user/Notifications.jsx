import { Link } from 'react-router-dom';
import { AlertTriangle, Bell, CheckCheck, Info, OctagonAlert, X } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';

const SEV = { danger: [OctagonAlert, 'text-rose-600 bg-rose-100 dark:bg-rose-950'], warning: [AlertTriangle, 'text-amber-600 bg-amber-100 dark:bg-amber-950'], info: [Info, 'text-brand-700 bg-brand-100 dark:bg-brand-900'] };

export default function Notifications() {
  const { items, unread, markRead, markAllRead, clear, clearAll } = useNotifications();
  return (
    <>
      <PageHeader title="Notifications" subtitle={`${unread} unread. Alerts are generated from your budgets, schedules and goals.`}>
        <button className="btn-ghost" disabled={!unread} onClick={markAllRead}><CheckCheck className="h-4 w-4" />Mark all read</button>
        <button className="btn-ghost" disabled={!items.length} onClick={clearAll}>Clear all</button>
      </PageHeader>
      <div className="card !p-0">
        {items.length === 0 ? <EmptyState icon={Bell} title="You’re all caught up" text="Budget warnings, due payments and goal reminders will appear here." /> : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">{items.map((n) => { const [Icon, cls] = SEV[n.severity]; return (
            <li key={n.id} className={`flex items-start gap-3 p-4 ${n.read ? 'opacity-70' : ''}`}>
              <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${cls}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{n.title}{!n.read && <span className="ml-2 inline-block h-2 w-2 rounded-full bg-brand-600" aria-label="Unread" />}</p><p className="mt-0.5 text-sm text-slate-500">{n.message}</p>
                <div className="mt-2 flex gap-3 text-xs font-semibold"><Link to={n.link} onClick={() => markRead(n.id)} className="text-brand-700 hover:underline dark:text-brand-400">View</Link>{!n.read && <button onClick={() => markRead(n.id)} className="text-slate-500 hover:underline">Mark as read</button>}</div></div>
              <button className="icon-btn" aria-label={`Clear: ${n.title}`} onClick={() => clear(n.id)}><X className="h-4 w-4" /></button>
            </li>); })}</ul>)}
      </div>
    </>
  );
}
