import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, Scale, Clock, ChevronRight, TrendingDown, Zap } from "lucide-react";

const denialTrend = [
  { month: "Jan", denied: 48200, recovered: 31000 },
  { month: "Feb", denied: 52100, recovered: 38000 },
  { month: "Mar", denied: 44800, recovered: 35500 },
  { month: "Apr", denied: 61000, recovered: 42000 },
  { month: "May", denied: 55200, recovered: 47000 },
  { month: "Jun", denied: 47800, recovered: 40200 },
];

const topDenialReasons = [
  { reason: "Missing/Invalid Info (CO-16)", count: 89, amount: 42100 },
  { reason: "Duplicate Claim (CO-97)", count: 54, amount: 28700 },
  { reason: "Medical Necessity (CO-50)", count: 41, amount: 61200 },
  { reason: "Code Inconsistency (CO-11)", count: 37, amount: 19800 },
  { reason: "Auth Required (CO-15)", count: 28, amount: 35400 },
];

const recentDenials = [
  { id: 1, claim: "CLM-2024-8821", patient: "Robert Chen", payer: "Blue Cross", code: "CO-16", amount: 1850, severity: "critical", status: "identified", days: 12, action: "Submit missing documentation" },
  { id: 2, claim: "CLM-2024-8799", patient: "Maria Santos", payer: "Medicare", code: "CO-50", amount: 3200, severity: "critical", status: "in_progress", days: 8, action: "Provide medical necessity letter" },
  { id: 3, claim: "CLM-2024-8754", patient: "James Wilson", payer: "Aetna", code: "CO-11", amount: 620, severity: "action_needed", status: "resubmitted", days: 21, action: "Verify CPT/ICD-10 pairing" },
  { id: 4, claim: "CLM-2024-8720", patient: "Emily Park", payer: "United Health", code: "CO-97", amount: 980, severity: "action_needed", status: "in_progress", days: 5, action: "Remove duplicate submission" },
  { id: 5, claim: "CLM-2024-8691", patient: "David Thompson", payer: "Medicaid", code: "PR-1", amount: 450, severity: "resolved", status: "recovered", days: 30, action: "Collected" },
];

const severityConfig = {
  critical: { label: "Critical", cls: "bg-red-100 text-red-700 border-red-200" },
  action_needed: { label: "Action Needed", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  resolved: { label: "Resolved", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

const statusConfig = {
  identified: { label: "Identified", cls: "bg-slate-100 text-slate-600" },
  in_progress: { label: "In Progress", cls: "bg-blue-100 text-blue-700" },
  resubmitted: { label: "Resubmitted", cls: "bg-purple-100 text-purple-700" },
  recovered: { label: "Recovered", cls: "bg-emerald-100 text-emerald-700" },
};

export default function DenialDashboard() {
  const { clinicId } = useClinic();
  const [prioritizing, setPrioritizing] = useState(false);

  const handlePrioritize = async () => {
    setPrioritizing(true);
    try {
      await base44.functions.invoke("awsClaims", { action: "ai_prioritize_denials", clinic_id: clinicId });
      toast.success("AI has reprioritized your denial queue.");
    } catch (e) {
      toast.error("Prioritization failed: " + (e.message || "Try again."));
    } finally { setPrioritizing(false); }
  };
  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Denied (MTD)", value: "$47,820", sub: "+12% vs last month", Icon: DollarSign, color: "text-red-500", bg: "bg-red-50" },
          { label: "Recovery Rate", value: "84%", sub: "$40,200 recovered", Icon: TrendingDown, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Open Appeals", value: "23", sub: "$31,400 in appeal", Icon: Scale, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Avg Days to Resolve", value: "14.2d", sub: "↓ 2.1d from last month", Icon: Clock, color: "text-primary", bg: "bg-primary/10" },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
              <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                <kpi.Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-semibold text-sm">Denial vs Recovery Trend</h3>
              <p className="text-xs text-muted-foreground">Last 6 months ($)</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> Denied</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Recovered</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={denialTrend} barSize={18} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, ""]} />
              <Bar dataKey="denied" fill="#f87171" radius={[4, 4, 0, 0]} name="Denied" />
              <Bar dataKey="recovered" fill="#34d399" radius={[4, 4, 0, 0]} name="Recovered" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold text-sm mb-1">Top Denial Reasons</h3>
          <p className="text-xs text-muted-foreground mb-4">By claim count</p>
          <div className="space-y-4">
            {topDenialReasons.map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-foreground leading-tight">{item.reason}</p>
                  <span className="text-xs font-semibold text-foreground ml-2 shrink-0">{item.count}</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-red-400" style={{ width: `${(item.count / 89) * 100}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">${(Number(item.amount) || 0).toLocaleString()} at risk</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Denials Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="font-heading font-semibold text-sm">Recent Denial Records</h3>
            <p className="text-xs text-muted-foreground">AI-analyzed with recommended actions</p>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handlePrioritize} disabled={prioritizing}>
            {prioritizing ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" /> : <Zap className="w-3 h-3" />}
            {prioritizing ? "Prioritizing..." : "AI Prioritize All"}
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                {["Claim #", "Patient", "Payer", "Code", "Amount", "Severity", "Status", "Days Out", "AI Action"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentDenials.map((row) => {
                const sev = severityConfig[row.severity];
                const st = statusConfig[row.status] || statusConfig.identified;
                return (
                  <tr key={row.id} className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-primary">{row.claim}</td>
                    <td className="px-4 py-3 font-medium">{row.patient}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{row.payer}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="font-mono text-xs">{row.code}</Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold">${(Number(row.amount) || 0).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge className={`${sev.cls} text-xs border`}>{sev.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${st.cls} text-xs`}>{st.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{row.days}d</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <p className="text-xs text-muted-foreground max-w-[160px] truncate">{row.action}</p>
                        <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}