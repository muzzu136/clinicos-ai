import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, DollarSign, AlertTriangle, Calendar, TrendingUp, Zap, RefreshCw, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

export default function AIDailySummary() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [aiNarrative, setAiNarrative] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setAiLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      const [apptRes, claimsRes] = await Promise.allSettled([
        base44.functions.invoke("awsAppointments", { action: "list" }),
        base44.functions.invoke("awsClaims", { action: "list" }),
      ]);

      const rawAppts = apptRes.status === "fulfilled" ? apptRes.value.data : [];
      const appts = Array.isArray(rawAppts) ? rawAppts
        : Array.isArray(rawAppts?.appointments) ? rawAppts.appointments
        : Array.isArray(rawAppts?.data) ? rawAppts.data : [];

      const rawClaims = claimsRes.status === "fulfilled" ? claimsRes.value.data : [];
      const claims = Array.isArray(rawClaims) ? rawClaims
        : Array.isArray(rawClaims?.claims) ? rawClaims.claims
        : Array.isArray(rawClaims?.data) ? rawClaims.data : [];

      const todayAppts = appts.filter(a => {
        const d = a.appointment_date || a.date || "";
        return d.startsWith(today);
      });

      const noShows = todayAppts.filter(a => a.status === "no_show").length;
      const completed = todayAppts.filter(a => a.status === "completed").length;
      const revenueToday = todayAppts.reduce((sum, a) => sum + (Number(a.revenue) || 0), 0);

      const deniedClaims = claims.filter(c => c.status === "denied" || c.status === "rejected");
      const claimsAtRisk = deniedClaims.reduce((sum, c) => sum + (Number(c.amount_billed) || 0), 0);
      const recoverableRevenue = deniedClaims.reduce((sum, c) => sum + (Number(c.amount_billed) || 0) * 0.67, 0);

      const metrics = {
        revenueToday,
        claimsAtRisk,
        recoverableRevenue,
        appointmentsLost: noShows,
        totalToday: todayAppts.length,
        completed,
        deniedCount: deniedClaims.length,
      };

      setSummary(metrics);
      setLastUpdated(new Date());

      // Generate AI narrative
      const prompt = `You are a clinic operations AI. Generate a concise daily briefing (4-5 bullet points) based on these metrics:
- Appointments today: ${todayAppts.length} (completed: ${completed}, no-shows: ${noShows})
- Revenue today: $${revenueToday.toLocaleString()}
- Denied claims at risk: $${claimsAtRisk.toLocaleString()} (${deniedClaims.length} claims)
- Estimated recoverable via appeals: $${Math.round(recoverableRevenue).toLocaleString()}

Each bullet should be a specific, actionable insight. Be direct and practical. Format as plain bullet points starting with "•".`;

      try {
        const aiRes = await base44.integrations.Core.InvokeLLM({ prompt });
        setAiNarrative(typeof aiRes === "string" ? aiRes : aiRes?.text || "");
      } catch (aiErr) {
        console.error("AI narrative failed:", aiErr);
      } finally {
        setAiLoading(false);
      }
    } catch (e) {
      console.error(e);
      setAiLoading(false);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const summaryItems = summary ? [
    { label: "Revenue Today", value: `$${Number(summary.revenueToday).toLocaleString()}`, icon: DollarSign, color: "text-emerald-400" },
    { label: "Claims At Risk", value: `$${Math.round(summary.claimsAtRisk).toLocaleString()}`, icon: AlertTriangle, color: "text-amber-400" },
    { label: "Recoverable", value: `$${Math.round(summary.recoverableRevenue).toLocaleString()}`, icon: TrendingUp, color: "text-primary" },
    { label: "No-Shows Today", value: String(summary.appointmentsLost), icon: Calendar, color: "text-red-400" },
  ] : [
    { label: "Revenue Today", value: "—", icon: DollarSign, color: "text-emerald-400" },
    { label: "Claims At Risk", value: "—", icon: AlertTriangle, color: "text-amber-400" },
    { label: "Recoverable", value: "—", icon: TrendingUp, color: "text-primary" },
    { label: "No-Shows Today", value: "—", icon: Calendar, color: "text-red-400" },
  ];

  const narrativeLines = aiNarrative
    ? aiNarrative.split("\n").filter(l => l.trim().startsWith("•") || l.trim().startsWith("-")).map(l => l.replace(/^[•\-]\s*/, "").trim()).filter(Boolean)
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg">AI Daily Summary</h3>
              <p className="text-xs text-white/50">
                {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Loading live data..."}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="text-white/60 hover:text-white hover:bg-white/10 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Metric tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {summaryItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10"
            >
              <item.icon className={`w-4 h-4 ${item.color} mb-2`} />
              {loading ? (
                <div className="w-16 h-5 bg-white/10 rounded animate-pulse mb-1" />
              ) : (
                <p className="text-lg font-heading font-bold">{item.value}</p>
              )}
              <p className="text-[10px] text-white/50">{item.label}</p>
            </motion.div>
          ))}
        </div>

        {/* AI Narrative */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-semibold text-white/90">AI Recommended Actions</h4>
            {aiLoading && <Loader2 className="w-3 h-3 text-white/40 animate-spin ml-1" />}
          </div>

          {aiLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="w-5 h-5 rounded-full bg-white/10 animate-pulse shrink-0 mt-0.5" />
                  <div className={`h-3 bg-white/10 rounded animate-pulse ${i % 2 === 0 ? "w-3/4" : "w-5/6"}`} />
                </div>
              ))}
            </div>
          ) : narrativeLines.length > 0 ? (
            <div className="space-y-2">
              {narrativeLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="flex items-start gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs text-white/70 leading-relaxed">{line}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/40">No actions generated yet — click Refresh to load.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}