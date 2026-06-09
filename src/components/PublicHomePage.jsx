import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import LandingPage from '@/pages/LandingPage';

export default function PublicHomePage() {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect to dashboard after auth check is complete AND user is authenticated
    if (!isLoadingAuth && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  // Always render landing page immediately — redirect happens in background
  return <LandingPage />;
}
