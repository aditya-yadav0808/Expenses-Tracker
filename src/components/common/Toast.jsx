import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const Ctx = createContext(null);
export const useToast = () => useContext(Ctx);
const STYLE = { success: ['border-emerald-500', CheckCircle2, 'text-emerald-600'], error: ['border-rose-500', AlertCircle, 'text-rose-600'], info: ['border-brand-500', Info, 'text-brand-600'] };

export function ToastProvider({ children }) {
  const [list, setList] = useState([]);
  const remove = (id) => setList((l) => l.filter((t) => t.id !== id));
  const push = useCallback((type, message) => {
    const id = Math.random().toString(36).slice(2);
    setList((l) => [...l, { id, type, message }]);
    setTimeout(() => setList((l) => l.filter((t) => t.id !== id)), 4000);
  }, []);
  const api = useMemo(() => ({ success: (m) => push('success', m), error: (m) => push('error', m), info: (m) => push('info', m) }), [push]);
  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2" role="status" aria-live="polite">
        {list.map((t) => { const [b, Icon, c] = STYLE[t.type]; return (
          <div key={t.id} className={`flex items-start gap-3 rounded-xl border-l-4 bg-white p-3 shadow-lg dark:bg-slate-800 ${b}`}>
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${c}`} aria-hidden="true" />
            <p className="flex-1 text-sm">{t.message}</p>
            <button className="text-slate-400 hover:text-slate-700" onClick={() => remove(t.id)} aria-label="Dismiss"><X className="h-4 w-4" /></button>
          </div>); })}
      </div>
    </Ctx.Provider>
  );
}
