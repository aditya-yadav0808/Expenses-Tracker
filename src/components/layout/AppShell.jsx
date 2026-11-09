import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAppData } from '../../context/AppDataContext';

/** Shared chrome for both panels: collapsible sidebar (drawer on mobile), top bar, content outlet. */
export default function AppShell({ nav, brandSub, ...topbar }) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('mm_sidebar') === '1');
  const [mobile, setMobile] = useState(false);
  const { pathname } = useLocation();
  const { data } = useAppData();
  useEffect(() => { setMobile(false); window.scrollTo(0, 0); }, [pathname]);
  const toggle = () => setCollapsed((c) => { localStorage.setItem('mm_sidebar', c ? '0' : '1'); return !c; });
  return (
    <div className="min-h-screen lg:flex">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[200] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
      <aside className={`hidden shrink-0 transition-[width] lg:sticky lg:top-0 lg:block lg:h-screen ${collapsed ? 'w-20' : 'w-64'}`}><Sidebar nav={nav} collapsed={collapsed} brandSub={brandSub} /></aside>
      {mobile && (
        <div className="fixed inset-0 z-40 lg:hidden" onKeyDown={(e) => e.key === 'Escape' && setMobile(false)}>
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobile(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 shadow-xl"><Sidebar nav={nav} brandSub={brandSub} onNavigate={() => setMobile(false)} /></aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar collapsed={collapsed} onToggleCollapse={toggle} onOpenMobile={() => setMobile(true)} {...topbar} />
        {data.appConfig.maintenanceBanner && <p role="status" className="bg-brand-700 px-4 py-2 text-center text-xs font-semibold text-white">Scheduled maintenance is planned. Some features may be briefly unavailable.</p>}
        <main id="main" className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
