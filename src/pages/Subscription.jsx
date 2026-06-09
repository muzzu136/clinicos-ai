import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  CheckCircle2, Zap, BrainCircuit, DollarSign,
  TrendingUp, Star, Phone, MapPin, Crown, ArrowRight, Loader2
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

const plans = [
  {
    name: "Starter",
    price: 149,
    badge: null,
    highlight: false,
    description: "Perfect for solo providers just getting started",
    features: [
      "1 Provider",
      "Patients & Appointments",
      "Claims Management",
      "AI Dashboard & Insights",
      "Email Support",
    ],
    missing: ["Full RCM & Claim Intelligence", "AI Campaigns & Retention", "AI Copilot", "Referrals & Leads"]
  },
  {
    name: "Growth",
    price: 399,
    badge: "Most Popular",
    highlight: true,
    description: "The full suite for growing practices ready to scale.",
    features: [
      "Up to 3 Providers",
      "Full RCM + Claim Intelligence",
      "Denial Auto-Appeals",
      "AI Copilot & Consultant",
      "Campaigns, Leads & Referrals",
      "Reputation Management",
      "Priority Email & Chat Support",
    ],
    missing: ["8+ Providers", "Multi-Location", "White Label"]
  },
  {
    name: "Professional",
    price: 799,
    badge: "Best Value",
    highlight: false,
    description: "The complete AI operating system for established practices.",
    features: [
      "Up to 8 Providers",
      "Everything in Growth",
      "Financial Intelligence & Forecasting",
      "Billing Automation",
      "Real-Time Eligibility Checks",
      "Staff & Operational Analytics",
      "Phone & Chat Support",
    ],
    missing: ["Multi-Location (Add-On)", "White Label"]
  },
  {
    name: "Enterprise",
    price: null,
    badge: null,
    highlight: false,
    description: "Unlimited scale for large groups & health systems.",
    features: [
      "Unlimited Providers",
      "Multi-Location (Included)",
      "White Label Branding",
      "Dedicated Account Manager",
      "Custom EHR Integrations",
      "SLA Guarantee (99.9%)",
      "All Professional Features",
    ],
    missing: []
  },
];

const addons = [
  {
    name: "AI Voice Receptionist",
    priceRange: "$199–$999/mo",
    icon: Phone,
    color: "bg-amber-50 text-amber-600",
    desc: "24/7 AI front desk — books appointments, handles FAQs, recovers missed calls.",
    tag: "Popular",
    tagColor: "bg-amber-100 text-amber-700"
  },
  {
    name: "Revenue Recovery",
    priceRange: "5–10% of recovered revenue",
    icon: DollarSign,
    color: "bg-emerald-50 text-emerald-600",
    desc: "Performance-based. AI recovers denied claims — you pay only when we recover.",
    tag: "Performance-Based",
    tagColor: "bg-emerald-100 text-emerald-700",
    example: "Example: $20K recovered → +$1,000–$2,000/mo"
  },
  {
    name: "Billing Automation",
    priceRange: "$299–$999/mo",
    icon: Zap,
    color: "bg-primary/10 text-primary",
    desc: "AI coding, prior auth automation, underpayment detection, text-to-pay.",
    tag: null
  },
  {
    name: "Multi-Location",
    priceRange: "$499+/mo per location",
    icon: MapPin,
    color: "bg-violet-50 text-violet-600",
    desc: "Full cross-location benchmarking, consolidated reporting, shared staff management.",
    tag: null
  },
];

const recoveryData = [
  { month: "Jan", recovered: 8200, denied: 14000 },
  { month: "Feb", recovered: 11500, denied: 16800 },
  { month: "Mar", recovered: 14200, denied: 18500 },
  { month: "Apr", recovered: 17800, denied: 21000 },
  { month: "May", recovered: 20100, denied: 22500 },
  { month: "Jun", recovered: 22400, denied: 24000 },
];

export default function Subscription() {
  const { clinicId } = useClinic();
  const [switchingPlan, setSwitchingPlan] = useState(null);
  const [addingAddon, setAddingAddon] = useState(null);

  const handleSwitchPlan = async (planName) => {
    setSwitchingPlan(planName);
    try {
      await base44.functions.invoke("awsSubscription", {
        action: "switch_plan",
        clinic_id: clinicId,
        plan_name: planName,
        billing_cycle: billing,
      });
      toast.success(`Switched to ${planName} plan. Your billing will be updated.`);
    } catch (e) {
      toast.error("Plan switch failed: " + (e.message || "Please contact support."));
    } finally { setSwitchingPlan(null); }
  };

  const handleAddAddon = async (addonName) => {
    setAddingAddon(addonName);
    try {
      await base44.functions.invoke("awsSubscription", {
        action: "add_addon",
        clinic_id: clinicId,
        addon_name: addonName,
      });
      toast.success(`${addonName} add-on activated. Our team will be in touch to set it up.`);
    } catch (e) {
      toast.error("Failed to add addon: " + (e.message || "Please contact support."));
    } finally { setAddingAddon(null); }
  };
  const [billing, setBilling] = useState("monthly");
  const currentPlan = "Professional";
  const totalRecovered = recoveryData.reduce((s, d) => s + d.recovered, 0);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-heading font-bold">Plan & Subscription</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your plan, add-ons, and track AI-recovered revenue</p>
      </div>

      {/* Current Plan Banner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 to-accent/5 border border-primary/20 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Crown className="w-6 h-6 text-primary" />
          </div>
          <div>
            <Badge className="bg-primary text-primary-foreground mb-1">Professional Plan — Active</Badge>
            <h3 className="text-2xl font-heading font-bold">$1,499 <span className="text-base font-normal text-muted-foreground">/ month</span></h3>
            <p className="text-sm text-muted-foreground">Billed monthly · Next renewal: July 4, 2026</p>
          </div>
        </div>
        <div className="flex gap-6 text-center">
          <div><p className="text-xl font-heading font-bold text-emerald-600">${(totalRecovered / 1000).toFixed(1)}K</p><p className="text-xs text-muted-foreground">Revenue Recovered YTD</p></div>
          <div><p className="text-xl font-heading font-bold">6</p><p className="text-xs text-muted-foreground">Providers Active</p></div>
          <div><p className="text-xl font-heading font-bold text-primary">94.2%</p><p className="text-xs text-muted-foreground">Collection Rate</p></div>
        </div>
      </motion.div>

      {/* Revenue Recovery Tracker */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-heading font-semibold">AI Revenue Recovery Tracker</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Revenue recovered from denied/rejected claims by AI automation</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-heading font-bold text-emerald-600">${(Number(totalRecovered) || 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Recovered (6 months)</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={recoveryData}>
            <defs>
              <linearGradient id="recoverGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0.25} />
                <stop offset="95%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} tickFormatter={v => `$${v / 1000}K`} />
            <Tooltip formatter={v => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: 12, border: "1px solid hsl(214, 32%, 91%)", fontSize: 12 }} />
            <Area type="monotone" dataKey="denied" stroke="hsl(0, 84%, 60%)" strokeWidth={1.5} strokeDasharray="4 4" fill="transparent" name="Total Denied" />
            <Area type="monotone" dataKey="recovered" stroke="hsl(172, 66%, 50%)" strokeWidth={2} fill="url(#recoverGrad)" name="AI Recovered" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-6 mt-3 justify-end">
          <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-emerald-500 rounded" /><span className="text-xs text-muted-foreground">AI Recovered</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-0.5 bg-red-400 rounded border-dashed" /><span className="text-xs text-muted-foreground">Total Denied</span></div>
        </div>
      </motion.div>

      {/* Plan Comparison */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg">Choose Your Plan</h2>
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            {["monthly", "annual"].map(b => (
              <button key={b} onClick={() => setBilling(b)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${billing === b ? "bg-background shadow text-foreground" : "text-muted-foreground"}`}>
                {b === "monthly" ? "Monthly" : "Annual (save 15%)"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan, i) => {
            const price = plan.price === null ? null : (billing === "annual" ? Math.round(plan.price * 0.80) : plan.price);
            const isCurrent = plan.name === currentPlan;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className={`rounded-2xl border p-5 flex flex-col relative ${plan.highlight ? "border-primary ring-2 ring-primary/20 bg-primary/3" : isCurrent ? "border-emerald-400 bg-emerald-50/30" : "border-border bg-card"}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow-md">{plan.badge}</Badge>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-600 text-white shadow-md">Current Plan</Badge>
                  </div>
                )}
                <div className="mb-4 mt-1">
                  <p className="font-heading font-bold text-lg">{plan.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{plan.description}</p>
                </div>
                <div className="mb-5">
                  <span className="text-3xl font-heading font-bold">
                    {price === null ? "Custom" : `$${price.toLocaleString()}`}
                  </span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                  {billing === "annual" && plan.price !== null && price !== null && (
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">
                      Save ${((plan.price - price) * 12).toLocaleString()}/yr
                    </p>
                  )}
                </div>
                <div className="space-y-1.5 flex-1 mb-5">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />{f}
                    </div>
                  ))}
                  {plan.missing.map((f, j) => (
                    <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground/60">
                      <span className="w-3.5 h-3.5 mt-0.5 shrink-0 text-center leading-none">—</span>{f}
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full gap-2"
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent || switchingPlan === plan.name}
                  onClick={() => !isCurrent && handleSwitchPlan(plan.name)}
                >
                  {switchingPlan === plan.name && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isCurrent ? "Current Plan" : switchingPlan === plan.name ? "Switching..." : `Switch to ${plan.name}`}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Add-ons */}
      <div>
        <h2 className="font-heading font-bold text-lg mb-4">Add-On Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addons.map((addon, i) => {
            const Icon = addon.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-card rounded-xl border border-border p-5 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${addon.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{addon.name}</p>
                      {addon.tag && <Badge className={`text-[10px] ${addon.tagColor}`}>{addon.tag}</Badge>}
                    </div>
                    <p className="text-sm font-medium text-primary">{addon.priceRange}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{addon.desc}</p>
                {addon.example && (
                  <p className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg px-3 py-2">{addon.example}</p>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  disabled={addingAddon === addon.name}
                  onClick={() => handleAddAddon(addon.name)}
                >
                  {addingAddon === addon.name ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-3 h-3" />}
                  {addingAddon === addon.name ? "Processing..." : "Add to Plan"}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}