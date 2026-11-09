import { useMemo } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';

const FALLBACK = { name: 'Uncategorized', color: '#94a3b8', icon: 'Tag', type: 'expense' };

/** Data scoped to the signed-in user, plus category helpers. */
export function useUserData() {
  const { data } = useAppData();
  const { user } = useAuth();
  return useMemo(() => {
    const id = user.id;
    const byId = new Map(data.categories.map((c) => [c.id, c]));
    return {
      transactions: data.transactions.filter((t) => t.userId === id),
      budgets: data.budgets.filter((b) => b.userId === id),
      goals: data.goals.filter((g) => g.userId === id),
      recurring: data.recurring.filter((r) => r.userId === id),
      // categories the user may pick for NEW records: active global ones + own custom ones
      categories: data.categories.filter((c) => (c.global ? c.active : c.userId === id)),
      getCat: (cid) => byId.get(cid) || FALLBACK,
    };
  }, [data, user.id]);
}
