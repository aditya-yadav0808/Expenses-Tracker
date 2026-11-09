import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, Settings, User } from 'lucide-react';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';

export default function ProfileMenu({ profilePath, settingsPath }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, []);
  const item = 'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800';
  return (
    <div className="relative" ref={ref}>
      <button className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:hover:bg-slate-800" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Avatar name={user.name} /><span className="hidden max-w-[8rem] truncate text-sm font-semibold sm:block">{user.name}</span><ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-3 pb-2 dark:border-slate-800"><p className="truncate text-sm font-bold">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div>
          <div className="pt-2">
            <Link role="menuitem" className={item} to={profilePath} onClick={() => setOpen(false)}><User className="h-4 w-4" />Profile</Link>
            <Link role="menuitem" className={item} to={settingsPath} onClick={() => setOpen(false)}><Settings className="h-4 w-4" />Settings</Link>
            <button role="menuitem" className={`${item} text-rose-600`} onClick={() => { logout(); nav('/login', { replace: true }); }}><LogOut className="h-4 w-4" />Log out</button>
          </div>
        </div>
      )}
    </div>
  );
}
