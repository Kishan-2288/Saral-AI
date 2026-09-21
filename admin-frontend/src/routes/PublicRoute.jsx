import { Navigate } from './router';
import { useAuth } from '../hooks/useAuth';

export function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" /> : children;
}
