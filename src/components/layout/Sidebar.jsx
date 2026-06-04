import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Calendar, Users, DollarSign, TrendingUp,
  Star, MessageSquare, Phone, BarChart3, Bot,
  FileText, UserPlus, Building2, ChevronLeft, ChevronRight,
  Activity, BrainCircuit, Mic, GitBranch, Eye, MapPin,
  LineChart, Briefcase, Settings, Award
} from "lucide-react";
import { useState } from "react";

const navGroups = [
  {
    label: "Command Center",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/" },
      { label: "AI Copilot", icon: BrainCircuit, path: "/copilot" },
      { label: "AI Consultant", icon: Briefcase, path: "/business-consultant" },
    ]
  },
  {
    label: "Operations",
    items: [
      { label: "Voice Receptionist", icon: Mic, path: "/voice-receptionist" },
      { label: "Appointments", icon: Calendar, path: "/appointments" },
      { label: "Patients", icon: Users, path: "/patients" },
      { label: "Providers", icon: Activity, path: "/providers" },
      { label: "Staff Productivity", icon: Award, path: "/staff-productivity" },
    ]
  },
  {
    label: "Revenue",
    items: [
      { label: "Revenue Cycle", icon: DollarSign, path: "/revenue-cycle" },
      { label: "Claims", icon: FileText, path: "/claims" },
      { label: "Financial Intel", icon: BarChart3, path: "/financials" },
      { label: "Predictive Analytics", icon: LineChart, path: "/predictive-analytics" },
    ]
  },
  {
    label: "Growth",
    items: [
      { label: "Campaigns", icon: TrendingUp, path: "/campaigns" },
      { label: "Reputation", icon: Star, path: "/reputation" },
      { label: "Leads", icon: UserPlus, path: "/leads" },
      { label: "Referrals", icon: GitBranch, path: "/referrals" },
      { label: "Competitor Intel", icon: Eye, path: "/competitor-intelligence" },
    ]
  },
  {
    label: "Communication",
    items: [
      { label: "Messages", icon: MessageSquare, path: "/messages" },
      { label: "Call Intel", icon: Phone, path: "/call-intelligence" },
    ]
  },
  {
    label: "Enterprise",
    items: [
      { label: "Multi-Location", icon: MapPin, path: "/multi-location" },
      { label: "Settings", icon: Settings, path: "/settings" },
    ]
  }
];

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col z-50 transition-all duration-300 border-r border-sidebar-border",
      collapsed ? "w-[72px]" : "w-[260px]"
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-heading font-bold text-base text-sidebar-foreground tracking-tight">ClinicOS</h1>
              <p className="text-[10px] text-sidebar-foreground/50 font-medium tracking-widest uppercase">AI Platform</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            {!collapsed && (
              <p className="text-[10px] font-semibold tracking-widest uppercase text-sidebar-foreground/40 px-3 mb-2">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-primary/20"
                        : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <item.icon className={cn("w-[18px] h-[18px] shrink-0", isActive && "drop-shadow-sm")} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-sidebar-border shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-sm"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}