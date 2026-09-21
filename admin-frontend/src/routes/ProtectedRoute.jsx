import { Navigate, useLocation } from './router';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  return user ? children : <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} />;
}
