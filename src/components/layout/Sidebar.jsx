import { NavLink } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

export default function Sidebar({ nav, collapsed, brandSub, onNavigate }) {
  const { data } = useAppData();
  return (
    <nav aria-label="Main navigation" className="flex h-full flex-col bg-slate-900 text-slate-300">
      <div className={`flex items-center gap-3 px-4 py-5 ${collapsed ? 'justify-center' : ''}`}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white"><Wallet className="h-5 w-5" aria-hidden="true" /></span>
        {!collapsed && <div><p className="font-extrabold leading-none text-white">{data.appConfig.appName}</p><p className="mt-1 text-xs text-slate-400">{brandSub}</p></div>}
      </div>
      <ul className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} onClick={onNavigate} title={collapsed ? label : undefined}
              className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${collapsed ? 'justify-center' : ''} ${isActive ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />{collapsed ? <span className="sr-only">{label}</span> : label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
