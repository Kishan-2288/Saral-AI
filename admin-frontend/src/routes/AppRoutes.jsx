import { Navigate, Route, Routes } from './router';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { AdminLayout } from '../components/Layout/AdminLayout';
import Login from '../pages/Login';
import VerifyEmail from '../pages/VerifyEmail';
import Dashboard from '../pages/Dashboard';
import Enterprises from '../pages/Enterprises';
import EnterpriseDetails from '../pages/EnterpriseDetails';
import { EnterpriseForm } from '../components/Enterprise/EnterpriseForm';
import Staff from '../pages/Staff';
import Analytics from '../pages/Analytics';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';

function ProtectedPage({ children }) {
  return <ProtectedRoute><AdminLayout>{children}</AdminLayout></ProtectedRoute>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route path="/dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
      <Route path="/enterprises" element={<ProtectedPage><Enterprises /></ProtectedPage>} />
      <Route path="/enterprises/new" element={<ProtectedPage><EnterpriseForm /></ProtectedPage>} />
      <Route path="/enterprises/:id" element={<ProtectedPage><EnterpriseDetails /></ProtectedPage>} />
      <Route path="/staff" element={<ProtectedPage><Staff /></ProtectedPage>} />
      <Route path="/analytics" element={<ProtectedPage><Analytics /></ProtectedPage>} />
      <Route path="/settings" element={<ProtectedPage><Settings /></ProtectedPage>} />

      <Route path="*" element={<ProtectedPage><NotFound /></ProtectedPage>} />
    </Routes>
  );
}
