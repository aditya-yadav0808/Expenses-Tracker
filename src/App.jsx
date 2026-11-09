import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute, { PublicOnly, RootRedirect } from './routes/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import NotFound from './pages/NotFound';
import Dashboard from './pages/user/Dashboard';
import Transactions from './pages/user/Transactions';
import TransactionFormPage from './pages/user/TransactionFormPage';
import Budgets from './pages/user/Budgets';
import Reports from './pages/user/Reports';
import SavingsGoals from './pages/user/SavingsGoals';
import Categories from './pages/user/Categories';
import RecurringTransactions from './pages/user/RecurringTransactions';
import Notifications from './pages/user/Notifications';
import Profile from './pages/user/Profile';
import Settings from './pages/user/Settings';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminCategories from './pages/admin/AdminCategories';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';
import AuditLogs from './pages/admin/AuditLogs';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route element={<PublicOnly />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>
      </Route>

      {/* User panel – role "user" only (client-side guard) */}
      <Route element={<ProtectedRoute role="user" />}>
        <Route element={<UserLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transactions/new" element={<TransactionFormPage />} />
          <Route path="/transactions/:id/edit" element={<TransactionFormPage />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/savings-goals" element={<SavingsGoals />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/recurring-transactions" element={<RecurringTransactions />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Admin panel – role "admin" only */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
