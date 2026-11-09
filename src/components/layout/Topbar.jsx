import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, Moon, PanelLeftClose, PanelLeftOpen, Search, Sun } from 'lucide-react';
import ProfileMenu from './ProfileMenu';
import { useTheme } from '../../context/ThemeContext';

export default function Topbar({ collapsed, onToggleCollapse, onOpenMobile, searchPath, searchPlaceholder, notifPath, unread = 0, profilePath, settingsPath }) {
  const { theme, toggle } = useTheme();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-slate-200 bg-white/90 px-3 py-2.5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 md:px-6">
      <button className="icon-btn lg:hidden" onClick={onOpenMobile} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
      <button className="icon-btn hidden lg:inline-flex" onClick={onToggleCollapse} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}</button>
      <form role="search" className="relative max-w-md flex-1" onSubmit={(e) => { e.preventDefault(); nav(`${searchPath}?q=${encodeURIComponent(q.trim())}`); }}>
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} aria-label={searchPlaceholder} className="input !pl-9" />
      </form>
      <div className="ml-auto flex items-center gap-1">
        <button className="icon-btn" onClick={toggle} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}>{theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</button>
        {notifPath && (
          <Link to={notifPath} className="icon-btn relative" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}>
            <Bell className="h-5 w-5" />
            {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">{unread}</span>}
          </Link>
        )}
        <ProfileMenu profilePath={profilePath} settingsPath={settingsPath} />
      </div>
    </header>
  );
}
