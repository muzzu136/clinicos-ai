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

const kpis = [
  { title: "Monthly Revenue", value: "$242,800", change: 12.4, changeLabel: "vs last month", icon: DollarSign, iconColor: "bg-emerald-100 text-emerald-600" },
  { title: "Active Patients", value: "2,847", change: 8.2, changeLabel: "vs last month", icon: Users, iconColor: "bg-primary/10 text-primary" },
  { title: "Appointments Today", value: "48", change: -2.1, changeLabel: "vs avg day", icon: Calendar, iconColor: "bg-amber-100 text-amber-600" },
  { title: "Collection Rate", value: "94.2%", change: 3.6, changeLabel: "vs last month", icon: TrendingUp, iconColor: "bg-violet-100 text-violet-600" },
  { title: "Claims Pending", value: "82", change: -15.3, changeLabel: "fewer than last month", icon: FileText, iconColor: "bg-sky-100 text-sky-600" },
  { title: "Calls Handled (AI)", value: "312", change: 28.5, changeLabel: "vs last month", icon: Phone, iconColor: "bg-indigo-100 text-indigo-600" },
  { title: "Avg Rating", value: "4.8", change: 0.3, changeLabel: "vs last quarter", icon: Star, iconColor: "bg-amber-100 text-amber-600" },
  { title: "New Patients", value: "64", change: 18.7, changeLabel: "vs last month", icon: UserPlus, iconColor: "bg-emerald-100 text-emerald-600" },
];

export default function Dashboard() {
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