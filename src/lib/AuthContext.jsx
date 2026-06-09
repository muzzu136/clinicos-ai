import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';

const AuthContext = createContext();

// Pages that don't need auth at all - never show loading spinner on these
const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/onboarding', '/pricing', '/landing'];

const isPublicPath = () => {
  const path = window.location.pathname;
  return PUBLIC_PATHS.some(p => path === p || path.startsWith(p + '?'));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(!isPublicPath()); // Don't block public pages
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false); // No longer blocks render
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(isPublicPath()); // Public pages = already "checked"
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    // If there's a token, try to validate it
    if (appParams.token) {
      await checkUserAuth();
    } else {
      // No token - definitely not authenticated, don't spin
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setAuthChecked(true);
    }

    // Load public settings in background (non-blocking)
    loadPublicSettings();
  };

  const loadPublicSettings = async () => {
    if (!appParams.appId) return;
    try {
      const res = await fetch(`/api/apps/public/prod/public-settings/by-id/${appParams.appId}`, {
        headers: { 'X-App-Id': appParams.appId }
      });
      if (res.ok) {
        const data = await res.json();
        setAppPublicSettings(data);
      }
    } catch {
      // Non-critical — don't set authError for this
    }
  };

  const checkUserAuth = async () => {
    setIsLoadingAuth(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      // Only set auth error for actual auth failures, not network errors
      if (error?.status === 401) {
        // Token expired — clear it silently, don't redirect
        try { base44.auth.logout(false); } catch {}
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthChecked(true);
    try {
      base44.auth.logout();
    } catch {}
    if (shouldRedirect) {
      window.location.href = '/';
    }
  };

  const navigateToLogin = () => {
    // Prevent redirect loop: never redirect to login if already on login
    const currentPath = window.location.pathname;
    if (currentPath === '/login' || currentPath === '/register' || currentPath === '/') return;
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState: checkAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
