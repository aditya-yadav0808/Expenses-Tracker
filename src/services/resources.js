// Per-domain REST service modules. The UI currently talks to LocalStorage through AppDataContext;
// when Spring Boot is ready, back each context action with the matching function below.
// Suggested models (JSON):
//  User        { id, name, email, role: 'user'|'admin', status: 'active'|'inactive', createdAt, lastLogin, prefs }
//  Transaction { id, userId, type: 'income'|'expense', amount, categoryId, date, paymentMethod, description, notes, recurringId?, dueDate? }
//  Budget      { id, userId, month: 'YYYY-MM', categoryId|null, limit }
//  Category    { id, name, type, icon, color, global, active, userId|null }
//  Goal        { id, userId, name, target, saved, deadline }
//  Recurring   { id, userId, type, amount, categoryId, frequency, startDate, endDate, status, paymentMethod, description }
import api from './api';

const resource = (path) => ({
  list: (params) => api.get(path, { params }).then((r) => r.data),
  get: (id) => api.get(`${path}/${id}`).then((r) => r.data),
  create: (body) => api.post(path, body).then((r) => r.data),
  update: (id, body) => api.put(`${path}/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`${path}/${id}`).then((r) => r.data),
});

export const authService = {
  login: (body) => api.post('/auth/login', body).then((r) => r.data),
  register: (body) => api.post('/auth/register', body).then((r) => r.data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data),
  logout: () => api.post('/auth/logout'),
};
export const transactionService = resource('/transactions');
export const budgetService = resource('/budgets');
export const categoryService = resource('/categories');
export const goalService = resource('/savings-goals');
export const recurringService = resource('/recurring-transactions');
export const userAdminService = resource('/admin/users');
export const auditService = { list: (params) => api.get('/admin/audit-logs', { params }).then((r) => r.data) };
