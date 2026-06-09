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
import BillingReport from '@/pages/BillingReport';
import CustomerDashboard from '@/pages/CustomerDashboard';
import CustomerPatients from '@/pages/CustomerPatients';
import SubscriptionPlans from '@/pages/SubscriptionPlans';
import ClinicOnboarding from '@/pages/ClinicOnboarding';
import LandingPage from '@/pages/LandingPage';
import PublicHomePage from '@/components/PublicHomePage';
import AdminClinicManagement from '@/pages/AdminClinicManagement';
import ClaimIntelligence from '@/pages/ClaimIntelligence';
import { ClinicProvider } from '@/components/ClinicContext';

const AuthenticatedApp = () => {
  const { authError } = useAuth();

  // Only show the user_not_registered error globally
  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // NOTE: No global loading spinner here — public pages (landing, login, register)
  // render immediately. Protected pages show their own loading states via ProtectedRoute.

  return (
    <Routes>
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/onboarding" element={<ClinicOnboarding />} />
      <Route path="/pricing" element={<LandingPage />} />
      <Route path="/" element={<PublicHomePage />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<ClinicProvider><AppLayout /></ClinicProvider>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/customer/dashboard" element={<CustomerDashboard />} />
          <Route path="/customer/patients" element={<CustomerPatients />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/revenue-cycle" element={<RevenueCycle />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/billing-report" element={<BillingReport />} />
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
          <Route path="/pricing" element={<SubscriptionPlans />} />
          <Route path="/admin/clinics" element={<AdminClinicManagement />} />
          <Route path="/claim-intelligence" element={<ClaimIntelligence />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <AuthProvider>
        <Router>
          <AuthenticatedApp />
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
