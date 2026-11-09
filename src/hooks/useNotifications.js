import { useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { useUserData } from './useUserData';
import { useFormat } from './useFormat';
import { deriveNotifications } from '../utils/calculations';

/** Notifications are derived from live data; only read/cleared state is stored. */
export function useNotifications() {
  const { data, act } = useAppData();
  const { user } = useAuth();
  const { transactions, budgets, goals, recurring, getCat } = useUserData();
  const { fmt } = useFormat();
  const st = data.notifState[user.id] || { read: [], cleared: [] };
  const items = useMemo(() => deriveNotifications({ txs: transactions, budgets, goals, recurring, getCat, fmt, prefs: user.prefs })
    .filter((n) => !st.cleared.includes(n.id)).map((n) => ({ ...n, read: st.read.includes(n.id) })),
  [transactions, budgets, goals, recurring, getCat, fmt, user.prefs, st.cleared, st.read]);
  return {
    items, unread: items.filter((n) => !n.read).length,
    markRead: (id) => act.setNotifState(user.id, (s) => ({ ...s, read: [...new Set([...s.read, id])] })),
    markAllRead: () => act.setNotifState(user.id, (s) => ({ ...s, read: [...new Set([...s.read, ...items.map((n) => n.id)])] })),
    clear: (id) => act.setNotifState(user.id, (s) => ({ ...s, cleared: [...new Set([...s.cleared, id])] })),
    clearAll: () => act.setNotifState(user.id, (s) => ({ ...s, cleared: [...new Set([...s.cleared, ...items.map((n) => n.id)])] })),
  };
}
