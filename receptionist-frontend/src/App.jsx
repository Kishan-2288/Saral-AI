import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import Shell from './layouts/Shell';
import './index.css';

function App() {
  const { user } = useAuth();

  if (window.location.pathname === '/verify-email') return <VerifyEmail />;

  return user ? <Shell /> : <Login />;
}

export default function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}