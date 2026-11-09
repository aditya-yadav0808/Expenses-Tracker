// Simple file-backed authentication (password hashes in server/db.json). Not production-grade:
// with Spring Boot, replace with JWT/session auth and enforce roles on the server (Spring Security).
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useAppData } from './AppDataContext';
import { clearSession, loadSession, saveSession, setPassword, verifyPassword } from '../services/storageService';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const { data, act } = useAppData();
  const [session, setSession] = useState(loadSession);
  // An account deactivated by an admin is signed out immediately.
  const user = useMemo(() => (session && data.users.find((u) => u.id === session.userId && u.status === 'active')) || null, [session, data.users]);

  const start = useCallback((u, remember) => { saveSession({ userId: u.id }, remember); setSession({ userId: u.id }); act.updateUser(u.id, { lastLogin: new Date().toISOString() }); }, [act]);

  const login = useCallback(async ({ email, password, remember }) => {
    const u = data.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u || !(await verifyPassword(u.id, password))) return { ok: false, error: 'Invalid email or password.' };
    if (u.status !== 'active') return { ok: false, error: 'This account has been deactivated. Contact an administrator.' };
    start(u, remember); return { ok: true, user: u };
  }, [data.users, start]);

  const register = useCallback(async ({ name, email, password }) => {
    if (!data.appConfig.allowRegistration) return { ok: false, error: 'Registration is currently disabled.' };
    if (data.users.some((x) => x.email.toLowerCase() === email.trim().toLowerCase())) return { ok: false, error: 'An account with this email already exists.' };
    const u = act.addUser({ name: name.trim(), email: email.trim(), role: 'user', status: 'active', createdAt: new Date().toISOString(), lastLogin: new Date().toISOString(), prefs: { currency: data.appConfig.defaultCurrency || 'INR', dateFormat: 'DD MMM YYYY', notifyBudget: true, notifyRecurring: true, notifyGoals: true } });
    const pw = await setPassword(u.id, password);
    if (!pw.ok) return { ok: false, error: pw.error || 'Could not save the account. Please try again.' };
    start(u, false); return { ok: true, user: u };
  }, [data.users, data.appConfig, act, start]);

  const changePassword = useCallback(async (current, next) => {
    const r = await setPassword(user.id, next, current);
    return r.ok ? { ok: true } : { ok: false, error: r.error || 'Could not change the password.' };
  }, [user]);

  const logout = useCallback(() => { clearSession(); setSession(null); }, []);
  const value = useMemo(() => ({ user, login, register, logout, changePassword }), [user, login, register, logout, changePassword]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
