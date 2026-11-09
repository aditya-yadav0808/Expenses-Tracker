// Initial data used only when server/db.json does not exist yet. No sample transactions.
const cat = (id, name, type, icon, color) => ({ id, name, type, icon, color, global: true, active: true, userId: null });
export const DEFAULT_CATEGORIES = [
  cat('cat_food', 'Food & Dining', 'expense', 'Utensils', '#f97316'), cat('cat_groc', 'Groceries', 'expense', 'ShoppingCart', '#84cc16'),
  cat('cat_trans', 'Transport', 'expense', 'Car', '#0ea5e9'), cat('cat_shop', 'Shopping', 'expense', 'ShoppingBag', '#ec4899'),
  cat('cat_ent', 'Entertainment', 'expense', 'Film', '#a855f7'), cat('cat_health', 'Health', 'expense', 'HeartPulse', '#ef4444'),
  cat('cat_util', 'Utilities', 'expense', 'Zap', '#eab308'), cat('cat_rent', 'Rent', 'expense', 'Home', '#6366f1'),
  cat('cat_edu', 'Education', 'expense', 'GraduationCap', '#14b8a6'), cat('cat_ins', 'Insurance', 'expense', 'Shield', '#64748b'),
  cat('cat_oexp', 'Other Expense', 'expense', 'Tag', '#94a3b8'),
  cat('cat_sal', 'Salary', 'income', 'Briefcase', '#16a34a'), cat('cat_free', 'Freelance', 'income', 'Laptop', '#0e7490'),
  cat('cat_inv', 'Investments', 'income', 'TrendingUp', '#7c3aed'), cat('cat_gift', 'Gifts', 'income', 'Gift', '#db2777'),
  cat('cat_oinc', 'Other Income', 'income', 'Tag', '#94a3b8'),
];

export const STARTER_ACCOUNTS = {
  admin: { id: 'u_admin', name: 'Admin', email: 'admin@moneywise.com', password: 'Admin@123', role: 'admin' },
  user: { id: 'u_user', name: 'Test User', email: 'user@moneywise.com', password: 'User@123', role: 'user' },
};

export function buildInitialData() {
  const now = new Date().toISOString();
  const prefs = { currency: 'INR', dateFormat: 'DD MMM YYYY', notifyBudget: true, notifyRecurring: true, notifyGoals: true };
  const users = Object.values(STARTER_ACCOUNTS).map(({ id, name, email, role }) => ({ id, name, email, role, status: 'active', createdAt: now, lastLogin: now, prefs: { ...prefs } }));
  return {
    users, transactions: [], budgets: [], categories: DEFAULT_CATEGORIES, goals: [], recurring: [], notifState: {}, audit: [],
    appConfig: { appName: 'MoneyWise', allowRegistration: true, defaultCurrency: 'INR', maintenanceBanner: false, sessionTimeoutMin: 30 },
  };
}
