import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import LandingPage from '@/pages/LandingPage';

/**
 * Shows the landing page to guests.
 * Authenticated users are redirected to /dashboard.
 */
export default function PublicHomePage() {
  const { isAuthenticated, isLoadingAuth, isLoadingPublicSettings } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoadingAuth && !isLoadingPublicSettings && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, isLoadingPublicSettings, navigate]);

  // Still loading auth — show landing page (not a blank screen)
  return <LandingPage />;
}
