import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground font-medium">Loading ClinicOS AI...</p>
    </div>
  </div>
);

export default function ProtectedRoute({ unauthenticatedElement }) {
  const { isAuthenticated, isLoadingAuth, authChecked } = useAuth();

  // Still checking auth — show spinner only on protected pages
  if (isLoadingAuth || !authChecked) {
    return <Spinner />;
  }

  // Not authenticated — redirect to login
  if (!isAuthenticated) {
    return unauthenticatedElement || <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
