import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import Patients from '@/pages/Patients';
import Appointments from '@/pages/Appointments';
import RevenueCycle from '@/pages/RevenueCycle';
import Claims from '@/pages/Claims';
import Financials from '@/pages/Financials';
import Campaigns from '@/pages/Campaigns';
import Reputation from '@/pages/Reputation';
import Leads from '@/pages/Leads';
import Providers from '@/pages/Providers';
import Messages from '@/pages/Messages';
import CallIntelligence from '@/pages/CallIntelligence';
import AICopilot from '@/pages/AICopilot';
import StaffProductivity from '@/pages/StaffProductivity';
import Referrals from '@/pages/Referrals';
import CompetitorIntelligence from '@/pages/CompetitorIntelligence';
import MultiLocation from '@/pages/MultiLocation';
import PredictiveAnalytics from '@/pages/PredictiveAnalytics';
import BusinessConsultant from '@/pages/BusinessConsultant';
import Settings from '@/pages/Settings';
import VoiceReceptionist from '@/pages/VoiceReceptionist';
import Training from '@/pages/Training';
import Subscription from '@/pages/Subscription';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground font-medium">Loading ClinicOS AI...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/revenue-cycle" element={<RevenueCycle />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/financials" element={<Financials />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/reputation" element={<Reputation />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/providers" element={<Providers />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/call-intelligence" element={<CallIntelligence />} />
          <Route path="/copilot" element={<AICopilot />} />
          <Route path="/staff-productivity" element={<StaffProductivity />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/competitor-intelligence" element={<CompetitorIntelligence />} />
          <Route path="/multi-location" element={<MultiLocation />} />
          <Route path="/predictive-analytics" element={<PredictiveAnalytics />} />
          <Route path="/business-consultant" element={<BusinessConsultant />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/voice-receptionist" element={<VoiceReceptionist />} />
          <Route path="/training" element={<Training />} />
          <Route path="/subscription" element={<Subscription />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App