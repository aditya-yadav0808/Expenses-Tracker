import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homeFor } from '../utils/constants';

/** Client-side guard. Real authorization must be enforced by the backend. */
export default function ProtectedRoute({ role }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  if (role && user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return <Outlet />;
}
export function PublicOnly() {
  const { user } = useAuth();
  return user ? <Navigate to={homeFor(user.role)} replace /> : <Outlet />;
}
export function RootRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? homeFor(user.role) : '/login'} replace />;
}
