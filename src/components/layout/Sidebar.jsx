import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Calendar, Users, DollarSign, TrendingUp,
  Star, MessageSquare, BarChart3, Bot,
  FileText, UserPlus, GitBranch, MapPin,
  BrainCircuit, Mic, Settings, BookOpen, CreditCard,
  ShieldAlert, Activity, X, ChevronLeft, ChevronRight, Lock
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";

// Badge for plan-gated items
const PlanBadge = ({ plan }) => (
  <span className={cn(
    "ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0",
    plan === "Growth" && "bg-emerald-500/20 text-emerald-400",
    plan === "Professional" && "bg-violet-500/20 text-violet-400",
    plan === "Enterprise" && "bg-amber-500/20 text-amber-400",
  )}>
    {plan}
  </span>
);

const navGroups = [
  {
    label: "Command Center",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { label: "AI Command Center", icon: BrainCircuit, path: "/copilot" },
    ]
  },
  {
    label: "Operations",
    items: [
      { label: "Patients", icon: Users, path: "/patients" },
      { label: "Appointments", icon: Calendar, path: "/appointments" },
      { label: "Providers", icon: Activity, path: "/providers" },
      { label: "Messages", icon: MessageSquare, path: "/messages" },
      { label: "Voice Receptionist", icon: Mic, path: "/voice-receptionist", plan: "Add-on" },
    ]
  },
  {
    label: "Revenue",
    items: [
      { label: "Claims", icon: FileText, path: "/claims" },
      { label: "Claim Intelligence", icon: ShieldAlert, path: "/claim-intelligence" },
      { label: "Revenue Cycle", icon: DollarSign, path: "/revenue-cycle" },
      { label: "Financial Intel", icon: BarChart3, path: "/financials" },
      { label: "Billing Report", icon: DollarSign, path: "/billing-report" },
    ]
  },
  {
    label: "Growth",
    items: [
      { label: "Campaigns", icon: TrendingUp, path: "/campaigns" },
      { label: "Reputation", icon: Star, path: "/reputation" },
      { label: "Leads", icon: UserPlus, path: "/leads" },
      { label: "Referrals", icon: GitBranch, path: "/referrals" },
    ]
  },
  {
    label: "Account",
    items: [
      { label: "Multi-Location", icon: MapPin, path: "/multi-location", plan: "Enterprise" },
      { label: "Plan & Billing", icon: CreditCard, path: "/subscription" },
      { label: "Settings", icon: Settings, path: "/settings" },
      { label: "Training Center", icon: BookOpen, path: "/training" },
    ]
  }
];

export default function Sidebar({ open = false, onClose }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col z-50 transition-all duration-300 border-r border-sidebar-border",
      collapsed ? "lg:w-[72px]" : "lg:w-[260px]",
      "w-[260px]",
      open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-sidebar-border shrink-0 justify-between">
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
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
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
                    onClick={onClose}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-primary/20"
                        : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <item.icon className={cn("w-[18px] h-[18px] shrink-0", isActive && "drop-shadow-sm")} />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.plan && <PlanBadge plan={item.plan} />}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle (desktop only) */}
      <div className="hidden lg:block p-3 border-t border-sidebar-border shrink-0">
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
