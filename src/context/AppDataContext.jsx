// Central data layer. All domain data lives in one object persisted to LocalStorage.
// Actions are grouped here; swap their bodies for API calls (services/resources.js) later.
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { loadData, saveData } from '../services/storageService';

const Ctx = createContext(null);
export const useAppData = () => useContext(Ctx);
export const uid = (p = 'id') => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const sameTx = (a, b) =>
  (b.recurringId && a.recurringId === b.recurringId && a.dueDate === b.dueDate) ||
  (a.userId === b.userId && a.type === b.type && a.amount === b.amount && a.categoryId === b.categoryId && a.date === b.date && a.paymentMethod === b.paymentMethod && a.description === b.description);

export function AppDataProvider({ children }) {
  const [data, setData] = useState(() => loadData());
  const ref = useRef(data); // always-current snapshot for synchronous duplicate checks
  ref.current = data;
  useEffect(() => { saveData(data); }, [data]);

  const act = useMemo(() => {
    const upd = (k, fn) => setData((d) => ({ ...d, [k]: fn(d[k]) }));
    const crud = (k, p) => ({
      add: (item) => { const n = { ...item, id: uid(p) }; upd(k, (l) => [n, ...l]); return n; },
      update: (id, patch) => upd(k, (l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x))),
      remove: (id) => upd(k, (l) => l.filter((x) => x.id !== id)),
    });
    const budgets = crud('budgets', 'bud'); const goals = crud('goals', 'goal'); const recurring = crud('recurring', 'rec'); const categories = crud('categories', 'cat');

    /** Adds transactions, silently skipping duplicates (same recurring occurrence or identical record). Returns the added list. */
    const addTransactions = (list) => {
      const known = [...ref.current.transactions]; const added = [];
      list.forEach((t) => {
        if (known.some((x) => sameTx(x, t))) return;
        const n = { ...t, id: uid('tx'), createdAt: new Date().toISOString() }; known.unshift(n); added.push(n);
      });
      if (added.length) { ref.current = { ...ref.current, transactions: known }; setData((d) => ({ ...d, transactions: [...added, ...d.transactions] })); }
      return added;
    };

    return {
      audit: (actor, action, target, details = '') =>
        upd('audit', (l) => [{ id: uid('aud'), timestamp: new Date().toISOString(), action, actor: actor.name, actorId: actor.id, target, details }, ...l].slice(0, 500)),
      addTransactions,
      addTransaction: (t) => addTransactions([t])[0] || null,
      updateTransaction: (id, patch) => upd('transactions', (l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x))),
      deleteTransaction: (id) => upd('transactions', (l) => l.filter((x) => x.id !== id)),
      addBudget: budgets.add, updateBudget: budgets.update, deleteBudget: budgets.remove,
      addGoal: goals.add, updateGoal: goals.update, deleteGoal: goals.remove,
      addRecurring: recurring.add, updateRecurring: recurring.update, deleteRecurring: recurring.remove,
      addCategory: categories.add, updateCategory: categories.update,
      /** Deletes a category; reassigns its transactions/recurring rules to `toId` and drops its budgets. */
      deleteCategory: (id, toId) => setData((d) => ({
        ...d,
        categories: d.categories.filter((c) => c.id !== id),
        transactions: toId ? d.transactions.map((t) => (t.categoryId === id ? { ...t, categoryId: toId } : t)) : d.transactions,
        recurring: toId ? d.recurring.map((r) => (r.categoryId === id ? { ...r, categoryId: toId } : r)) : d.recurring,
        budgets: d.budgets.filter((b) => b.categoryId !== id),
      })),
      addUser: (u) => { const n = { ...u, id: uid('u') }; upd('users', (l) => [...l, n]); return n; },
      updateUser: (id, patch) => upd('users', (l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x))),
      updateConfig: (patch) => setData((d) => ({ ...d, appConfig: { ...d.appConfig, ...patch } })),
      setNotifState: (userId, fn) => setData((d) => ({ ...d, notifState: { ...d.notifState, [userId]: fn(d.notifState[userId] || { read: [], cleared: [] }) } })),
    };
  }, []);

  const value = useMemo(() => ({ data, act }), [data, act]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
