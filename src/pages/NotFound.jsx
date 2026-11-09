import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homeFor } from '../utils/constants';

export default function NotFound() {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-6xl font-extrabold text-brand-700">404</p>
      <h1 className="text-xl font-bold">We couldn’t find that page</h1>
      <p className="text-sm text-slate-500">The link may be broken or the page may have moved.</p>
      <Link className="btn-primary mt-2" to={user ? homeFor(user.role) : '/login'}>{user ? 'Go to dashboard' : 'Go to log in'}</Link>
    </div>
  );
}
