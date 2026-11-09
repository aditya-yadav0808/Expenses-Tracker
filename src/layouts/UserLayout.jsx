import { LayoutDashboard, ArrowLeftRight, PiggyBank, BarChart3, Target, Tags, Repeat, Bell, User, Settings } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import { useNotifications } from '../hooks/useNotifications';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }, { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank }, { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/savings-goals', label: 'Savings goals', icon: Target }, { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/recurring-transactions', label: 'Recurring', icon: Repeat }, { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: User }, { to: '/settings', label: 'Settings', icon: Settings },
];
export default function UserLayout() {
  const { unread } = useNotifications();
  return <AppShell nav={NAV} brandSub="Personal finance" searchPath="/transactions" searchPlaceholder="Search transactions" notifPath="/notifications" unread={unread} profilePath="/profile" settingsPath="/settings" />;
}
