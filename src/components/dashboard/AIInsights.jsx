import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrainCircuit, AlertTriangle, DollarSign, Users, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";

const ICON_MAP = { revenue: DollarSign, patients: Users, schedule: Calendar, risk: AlertTriangle };
const COLOR_MAP = {
  revenue: "text-emerald-600 bg-emerald-50",
  patients: "text-primary bg-primary/10",
  schedule: "text-amber-600 bg-amber-50",
  risk: "text-red-500 bg-red-50",
};
const PRIORITY_STYLES = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-amber-100 text-amber-700 border-amber-200",
  medium: "bg-primary/10 text-primary border-primary/20",
};

export default function AIInsights() {
  const { clinicId } = useClinic();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clinicId) { setLoading(false); return; }
    const load = async () => {
      try {
        // Fetch real data to build insights from
        const [patientsRes, claimsRes, apptRes] = await Promise.allSettled([
          base44.functions.invoke("awsPatients", { action: "list", clinic_id: clinicId }),
          base44.functions.invoke("awsClaims", { action: "list", clinic_id: clinicId }),
          base44.functions.invoke("awsAppointments", { action: "list", clinic_id: clinicId }),
        ]);

        const patients = patientsRes.status === "fulfilled"
          ? (Array.isArray(patientsRes.value.data) ? patientsRes.value.data : patientsRes.value.data?.patients || []) : [];
        const claims = claimsRes.status === "fulfilled"
          ? (Array.isArray(claimsRes.value.data) ? claimsRes.value.data : claimsRes.value.data?.claims || []) : [];
        const appts = apptRes.status === "fulfilled"
          ? (Array.isArray(apptRes.value.data) ? apptRes.value.data : apptRes.value.data?.appointments || []) : [];

        const deniedClaims = claims.filter(c => c.status === "denied");
        const deniedAmount = deniedClaims.reduce((s, c) => s + (Number(c.amount_billed) || 0), 0);
        const inactivePatients = patients.filter(p => {
          const d = new Date(p.last_visit_date || p.lastVisit || p.updated_at);
          return !isNaN(d) && (Date.now() - d.getTime()) > 180 * 24 * 60 * 60 * 1000;
        });
        const atRiskPatients = patients.filter(p => (p.churn_risk_score || 0) > 60);
        const noShows = appts.filter(a => a.status === "no_show").length;

        const generated = [];
        if (deniedClaims.length > 0) {
          generated.push({ type: "revenue", priority: "high", title: "Revenue Recovery Opportunity",
            description: `${deniedClaims.length} denied claims totaling $${deniedAmount.toLocaleString()} are eligible for appeal. Review and resubmit to recover revenue.`,
            action: "Review Appeals" });
        }
        if (inactivePatients.length > 0) {
          generated.push({ type: "patients", priority: "medium", title: "Patient Reactivation Alert",
            description: `${inactivePatients.length} patients haven't visited in 6+ months. Launch a reactivation campaign to re-engage them.`,
            action: "Launch Campaign" });
        }
        if (atRiskPatients.length > 0) {
          generated.push({ type: "risk", priority: "critical", title: "Churn Risk Identified",
            description: `${atRiskPatients.length} high-value patients show high churn risk scores. Proactive outreach recommended.`,
            action: "View Patients" });
        }
        if (noShows > 0) {
          generated.push({ type: "schedule", priority: "high", title: "No-Show Impact",
            description: `${noShows} no-shows detected. Consider automated SMS reminders 24h and 2h before appointments.`,
            action: "Configure Reminders" });
        }
        setInsights(generated.length > 0 ? generated : [
          { type: "revenue", priority: "medium", title: "Getting Started", description: "Add patients, appointments, and claims to see AI-powered insights tailored to your clinic.", action: "Add Data" }
        ]);
      } catch { setInsights([]); }
      setLoading(false);
    };
    load();
  }, [clinicId]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
      className="bg-card rounded-2xl border border-border p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <BrainCircuit className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-foreground">AI Insights</h3>
          <p className="text-[10px] text-muted-foreground">Real-time recommendations</p>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-24 gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, i) => {
            const Icon = ICON_MAP[insight.type] || DollarSign;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }}
                className="group p-4 rounded-xl border border-border hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 transition-all">
                <div className="flex items-start gap-3">
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", COLOR_MAP[insight.type] || COLOR_MAP.revenue)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-foreground">{insight.title}</h4>
                      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", PRIORITY_STYLES[insight.priority] || PRIORITY_STYLES.medium)}>
                        {insight.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                    <Button variant="ghost" size="sm" className="text-primary text-xs mt-2 -ml-2 h-7 gap-1 hover:gap-2 transition-all">
                      {insight.action} <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
