import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";
import {
  Briefcase, TrendingUp, DollarSign, Users, Zap,
  CheckCircle2, AlertTriangle, Download, RefreshCw, Lightbulb
} from "lucide-react";

const weeklyRecommendations = [
  {
    category: "Revenue",
    priority: "high",
    title: "Recover $18,400 in Denied Claims",
    desc: "12 denied claims from UnitedHealth have correctable errors. CPT mismatch on 8 claims and missing modifier on 4 claims.",
    roi: "$18,400 recoverable",
    effort: "Low",
    action: "Review denied claims in RCM → Denial Management"
  },
  {
    category: "Growth",
    priority: "high",
    title: "Reactivate 47 Inactive Patients",
    desc: "47 patients haven't visited in 6–12 months and have annual wellness checks due. Average patient value: $380/visit.",
    roi: "$17,860 potential revenue",
    effort: "Low",
    action: "Launch reactivation campaign in Campaigns"
  },
  {
    category: "Operations",
    priority: "medium",
    title: "Optimize Dr. Kim's Schedule",
    desc: "Dr. Kim's Tuesdays are 61% utilized while her Thursdays are at 98%. Redistributing 3 slots can add ~$2,100/week.",
    roi: "+$8,400/month",
    effort: "Low",
    action: "Adjust schedule templates in Appointments"
  },
  {
    category: "Retention",
    priority: "medium",
    title: "Engage 31 High-Risk Churn Patients",
    desc: "31 active patients show behavioral signals for churn: no upcoming appointment + no contact in 45+ days.",
    roi: "Avg LTV at risk: $142K",
    effort: "Medium",
    action: "Send personalized outreach via Campaigns"
  },
  {
    category: "Revenue",
    priority: "medium",
    title: "Enable Text-to-Pay for Outstanding Balances",
    desc: "$34,200 in patient balances have no payment plan. Text-to-pay increases collection by 38% on average.",
    roi: "+$13,000 in collections",
    effort: "Low",
    action: "Activate text-to-pay in Financials → Collections"
  },
  {
    category: "Growth",
    priority: "low",
    title: "Add Google Posts for Weekend Hours",
    desc: "Competitors don't advertise weekend availability. Your Saturday 9AM–1PM slots are underutilized at 52%.",
    roi: "+6–8 new patients/mo",
    effort: "Low",
    action: "Create Google Business post highlighting weekend hours"
  },
];

const kpiTargets = [
  { metric: "Collection Rate", current: 94.2, target: 97, unit: "%", status: "good" },
  { metric: "No-Show Rate", current: 4.2, target: 2.5, unit: "%", status: "needs_work" },
  { metric: "Schedule Utilization", current: 87, target: 93, unit: "%", status: "good" },
  { metric: "Avg Reimbursement Days", current: 18, target: 12, unit: " days", status: "needs_work" },
  { metric: "Patient Retention Rate", current: 82, target: 90, unit: "%", status: "needs_work" },
  { metric: "New Patients/Month", current: 64, target: 80, unit: "", status: "good" },
];

const categoryColors = {
  Revenue: "bg-emerald-100 text-emerald-700",
  Growth: "bg-primary/10 text-primary",
  Operations: "bg-amber-100 text-amber-700",
  Retention: "bg-violet-100 text-violet-700",
};

export default function BusinessConsultant() {
  const { clinicId } = useClinic();
  const [tab, setTab] = useState("recommendations");
  const [loading, setLoading] = useState(false);
  const [executiveReport, setExecutiveReport] = useState(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Fetch real clinic metrics
      const [patientsRes, claimsRes, apptRes] = await Promise.allSettled([
        base44.functions.invoke("awsPatients", { action: "list", clinic_id: clinicId }),
        base44.functions.invoke("awsClaims", { action: "list", clinic_id: clinicId }),
        base44.functions.invoke("awsAppointments", { action: "list", clinic_id: clinicId }),
      ]);
      const patients = patientsRes.status === "fulfilled" ? (Array.isArray(patientsRes.value.data) ? patientsRes.value.data : patientsRes.value.data?.patients || []) : [];
      const claims = claimsRes.status === "fulfilled" ? (Array.isArray(claimsRes.value.data) ? claimsRes.value.data : claimsRes.value.data?.claims || []) : [];
      const appts = apptRes.status === "fulfilled" ? (Array.isArray(apptRes.value.data) ? apptRes.value.data : apptRes.value.data?.appointments || []) : [];

      const activePatients = patients.filter(p => p.status === "active").length;
      const totalRevenue = patients.reduce((s, p) => s + (p.total_revenue || 0), 0);
      const deniedClaims = claims.filter(c => c.status === "denied");
      const paidClaims = claims.filter(c => c.status === "paid").length;
      const collectionRate = claims.length > 0 ? Math.round((paidClaims / claims.length) * 100) : 0;
      const noShows = appts.filter(a => a.status === "no_show").length;
      const noShowRate = appts.length > 0 ? Math.round((noShows / appts.length) * 100) : 0;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI Business Consultant for a healthcare clinic. Generate a concise executive summary report based on these REAL metrics:

- Total Patients: ${patients.length} (${activePatients} active)
- Monthly Revenue: $${totalRevenue.toLocaleString()}
- Collection Rate: ${collectionRate}%
- No-Show Rate: ${noShowRate}%
- Denied Claims: ${deniedClaims.length} (total $${deniedClaims.reduce((s,c) => s+(Number(c.amount_billed)||0), 0).toLocaleString()})
- Total Claims: ${claims.length}
- Appointments: ${appts.length} total

Provide: 1) Key wins, 2) Top 3 risks, 3) Top 3 revenue opportunities, 4) One strategic recommendation for next 30 days.
Keep it executive-level, concise, and action-oriented. Use markdown formatting.`,
      });
      setExecutiveReport(result);
    } catch (e) {
      setExecutiveReport("Report generation failed: " + (e.message || "Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">AI Business Consultant</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Weekly AI-generated insights, opportunities, and strategic recommendations</p>
        </div>
        <Button onClick={generateReport} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Generating..." : "Generate Weekly Report"}
        </Button>
      </div>

      {executiveReport && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-5 h-5 text-primary" />
            <h3 className="font-heading font-semibold">AI Executive Report</h3>
            <Badge className="bg-primary/10 text-primary">Live AI</Badge>
          </div>
          <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{executiveReport}</div>
        </motion.div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
          <TabsTrigger value="targets">KPI Targets</TabsTrigger>
          <TabsTrigger value="roadmap">30-Day Roadmap</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "recommendations" && (
        <div className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm">AI has identified <strong>6 actionable opportunities</strong> this week with a combined revenue impact of <strong>$57,000+</strong>.</p>
          </div>

          {["high", "medium", "low"].map(priority => (
            <div key={priority}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                {priority === "high" ? "🔴" : priority === "medium" ? "🟡" : "🟢"} {priority} priority
              </h4>
              <div className="space-y-3">
                {weeklyRecommendations.filter(r => r.priority === priority).map((rec, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${categoryColors[rec.category]}`}>
                      {rec.category === "Revenue" ? <DollarSign className="w-4 h-4" /> :
                       rec.category === "Growth" ? <TrendingUp className="w-4 h-4" /> :
                       rec.category === "Operations" ? <Zap className="w-4 h-4" /> :
                       <Users className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{rec.title}</p>
                        <Badge className={categoryColors[rec.category]}>{rec.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.desc}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs">
                        <span className="text-emerald-600 font-medium">{rec.roi}</span>
                        <span className="text-muted-foreground">Effort: {rec.effort}</span>
                      </div>
                      <p className="text-xs text-primary mt-1">→ {rec.action}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "targets" && (
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="font-heading font-semibold">KPI Performance vs Targets</h3>
            </div>
            <div className="divide-y divide-border">
              {kpiTargets.map((kpi, i) => {
                const pct = kpi.status !== "needs_work" ? 100 : Math.round((kpi.current / kpi.target) * 100);
                return (
                  <div key={i} className="p-5 flex items-center gap-6">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{kpi.metric}</p>
                    </div>
                    <div className="flex items-center gap-2 w-48">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${kpi.status === "good" ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                    <div className="text-right w-32">
                      <span className="font-bold">{kpi.current}{kpi.unit}</span>
                      <span className="text-muted-foreground text-sm"> / {kpi.target}{kpi.unit}</span>
                    </div>
                    <Badge className={kpi.status === "good" ? "bg-emerald-100 text-emerald-700 w-24 justify-center" : "bg-amber-100 text-amber-700 w-24 justify-center"}>
                      {kpi.status === "good" ? "On Track" : "Needs Work"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "roadmap" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              week: "Week 1", theme: "Revenue Recovery",
              tasks: [
                "Resubmit 12 denied UnitedHealth claims",
                "Launch 47-patient reactivation SMS campaign",
                "Enable text-to-pay for 89 outstanding balances",
              ]
            },
            {
              week: "Week 2", theme: "Schedule Optimization",
              tasks: [
                "Redistribute Dr. Kim's Tuesday/Thursday slots",
                "Activate AI waitlist filling for open gaps",
                "Set up no-show prediction alerts for front desk",
              ]
            },
            {
              week: "Week 3", theme: "Patient Retention",
              tasks: [
                "Reach out to 31 high-risk churn patients",
                "Launch annual wellness reminder campaign",
                "Send referral appreciation notes to top MDs",
              ]
            },
            {
              week: "Week 4", theme: "Growth & Visibility",
              tasks: [
                "Post weekend hours on Google Business",
                "Request reviews from 40 recent satisfied patients",
                "Publish Spanish-language Google Ad campaign",
              ]
            },
            {
              week: "Month 2", theme: "Infrastructure",
              tasks: [
                "Implement prior auth tracking workflow",
                "Train staff on AI coding assistant for CPT accuracy",
                "Set up monthly competitor intelligence reports",
              ]
            },
            {
              week: "Month 3", theme: "Scale & Expand",
              tasks: [
                "Evaluate mental health service addition",
                "Begin South Loop clinic onboarding",
                "Launch physician referral appreciation program",
              ]
            },
          ].map((phase, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                <div>
                  <p className="font-semibold text-sm">{phase.week}</p>
                  <p className="text-xs text-muted-foreground">{phase.theme}</p>
                </div>
              </div>
              <div className="space-y-2">
                {phase.tasks.map((task, j) => (
                  <div key={j} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{task}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}