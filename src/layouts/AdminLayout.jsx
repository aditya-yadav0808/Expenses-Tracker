import { LayoutDashboard, Users, ArrowLeftRight, Tags, BarChart3, Settings, ScrollText } from 'lucide-react';
import AppShell from '../components/layout/AppShell';

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard }, { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight }, { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 }, { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/audit-logs', label: 'Audit logs', icon: ScrollText },
];
export default function AdminLayout() {
  return <AppShell nav={NAV} brandSub="Admin console" searchPath="/admin/users" searchPlaceholder="Search users" profilePath="/admin/settings" settingsPath="/admin/settings" />;
}
