export const PAYMENT_METHODS = ['Cash', 'UPI', 'Debit Card', 'Credit Card', 'Net Banking', 'Bank Transfer'];
export const FREQUENCIES = [{ value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }, { value: 'yearly', label: 'Yearly' }];
export const DATE_FORMATS = ['DD MMM YYYY', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
export const SWATCHES = ['#0e7490', '#0ea5e9', '#14b8a6', '#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444', '#ec4899', '#a855f7', '#6366f1', '#64748b'];
export const homeFor = (role) => (role === 'admin' ? '/admin/dashboard' : '/dashboard');
export const PERMISSIONS = [
  { name: 'View own transactions, budgets, goals', user: true, admin: false },
  { name: 'Create / edit / delete own financial records', user: true, admin: false },
  { name: 'View platform-wide transaction records (read-only)', user: false, admin: true },
  { name: 'Edit another user’s transactions', user: false, admin: false },
  { name: 'Activate / deactivate accounts', user: false, admin: true },
  { name: 'Assign roles', user: false, admin: true },
  { name: 'Manage global categories', user: false, admin: true },
  { name: 'View audit logs', user: false, admin: true },
];
