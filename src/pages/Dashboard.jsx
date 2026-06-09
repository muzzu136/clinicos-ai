import { useState, useEffect } from "react";
import KPICard from "@/components/dashboard/KPICard";
import AIDailySummary from "@/components/dashboard/AIDailySummary";
import RevenueChart from "@/components/dashboard/RevenueChart";
import ClaimsOverview from "@/components/dashboard/ClaimsOverview";
import AIInsights from "@/components/dashboard/AIInsights";
import TodaySchedule from "@/components/dashboard/TodaySchedule";
import ProviderPerformance from "@/components/dashboard/ProviderPerformance";
import RecoveryRevenueWidget from "@/components/dashboard/RecoveryRevenueWidget";
import {
  DollarSign, Users, Calendar, TrendingUp,
  FileText, Phone, Star, UserPlus
} from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Dashboard() {
  const [kpis, setKpis] = useState([
    { title: "Monthly Revenue", value: "—", change: 0, changeLabel: "loading", icon: DollarSign, iconColor: "bg-emerald-100 text-emerald-600" },
    { title: "Active Patients", value: "—", change: 0, changeLabel: "loading", icon: Users, iconColor: "bg-primary/10 text-primary" },
    { title: "Appointments Today", value: "—", change: 0, changeLabel: "loading", icon: Calendar, iconColor: "bg-amber-100 text-amber-600" },
    { title: "Collection Rate", value: "—", change: 0, changeLabel: "loading", icon: TrendingUp, iconColor: "bg-violet-100 text-violet-600" },
    { title: "Claims Pending", value: "—", change: 0, changeLabel: "loading", icon: FileText, iconColor: "bg-sky-100 text-sky-600" },
    { title: "Calls Handled (AI)", value: "—", change: 0, changeLabel: "loading", icon: Phone, iconColor: "bg-indigo-100 text-indigo-600" },
    { title: "Avg Rating", value: "—", change: 0, changeLabel: "loading", icon: Star, iconColor: "bg-amber-100 text-amber-600" },
    { title: "New Patients", value: "—", change: 0, changeLabel: "loading", icon: UserPlus, iconColor: "bg-emerald-100 text-emerald-600" },
  ]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [patientsRes, appointmentsRes, claimsRes] = await Promise.all([
          base44.functions.invoke("awsPatients", { action: "list" }),
          base44.functions.invoke("awsAppointments", { action: "list" }),
          base44.functions.invoke("awsClaims", { action: "list" })
        ]);

        const patients = Array.isArray(patientsRes.data) ? patientsRes.data : patientsRes.data?.patients || [];
        const appointments = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : appointmentsRes.data?.appointments || [];
        const claims = Array.isArray(claimsRes.data) ? claimsRes.data : claimsRes.data?.claims || [];

        const activePatients = patients.filter(p => p.status === "active").length;
        const todayAppts = appointments.filter(a => new Date(a.appointment_date).toDateString() === new Date().toDateString()).length;
        const totalRevenue = patients.reduce((sum, p) => sum + (p.total_revenue || 0), 0);
        const pendingClaims = claims.filter(c => ["submitted", "pending"].includes(c.status)).length;
        const paidClaims = claims.filter(c => c.status === "paid").length;
        const collectionRate = claims.length > 0 ? Math.round((paidClaims / claims.length) * 100) : 0;

        setKpis([
          { title: "Monthly Revenue", value: `$${(totalRevenue / 1000).toFixed(0)}K`, change: null, changeLabel: "month to date", icon: DollarSign, iconColor: "bg-emerald-100 text-emerald-600" },
          { title: "Active Patients", value: activePatients.toString(), change: null, changeLabel: "currently active", icon: Users, iconColor: "bg-primary/10 text-primary" },
          { title: "Appointments Today", value: todayAppts.toString(), change: null, changeLabel: "scheduled today", icon: Calendar, iconColor: "bg-amber-100 text-amber-600" },
          { title: "Collection Rate", value: `${collectionRate}%`, change: null, changeLabel: "of claims paid", icon: TrendingUp, iconColor: "bg-violet-100 text-violet-600" },
          { title: "Claims Pending", value: pendingClaims.toString(), change: null, changeLabel: "awaiting payment", icon: FileText, iconColor: "bg-sky-100 text-sky-600" },
          { title: "Total Patients", value: patients.length.toString(), change: null, changeLabel: "in database", icon: Phone, iconColor: "bg-indigo-100 text-indigo-600" },
          { title: "Denied Claims", value: claims.filter(c => c.status === "denied").length.toString(), change: null, changeLabel: "need attention", icon: Star, iconColor: "bg-amber-100 text-amber-600" },
          { title: "New Patients", value: patients.filter(p => { const d = new Date(p.created_at || p.date_added); return !isNaN(d) && d >= new Date(Date.now() - 30*24*60*60*1000); }).length.toString(), change: null, changeLabel: "last 30 days", icon: UserPlus, iconColor: "bg-emerald-100 text-emerald-600" },
        ]);
      } catch (e) {
        console.error("Failed to load dashboard data:", e);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Command Center</h1>
        <p className="text-sm text-muted-foreground mt-0.5">AI-powered clinic intelligence — updated in real time</p>
      </div>

      {/* AI Daily Summary */}
      <AIDailySummary />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard key={i} {...kpi} index={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <ClaimsOverview />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TodaySchedule />
        <AIInsights />
        <ProviderPerformance />
      </div>

      {/* Recovery Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecoveryRevenueWidget />
      </div>
    </div>
  );
}