import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BrainCircuit, Send, Sparkles, Loader2, AlertCircle,
  Briefcase, RefreshCw, TrendingUp, AlertTriangle, DollarSign, Target
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";

const COPILOT_QUESTIONS = [
  "Why did revenue decrease this week?",
  "Which provider is most profitable?",
  "How many patients are overdue for follow-up?",
  "Which denied claims should be prioritized?",
  "What's our no-show rate trend?",
  "Recommend ways to increase collections",
];

const CONSULTANT_QUESTIONS = [
  "Generate my weekly executive summary",
  "What are my top 3 revenue opportunities?",
  "Where am I losing the most money?",
  "How do I improve my collection rate?",
  "What should I focus on this month?",
  "Compare my performance to benchmarks",
];

export default function AICopilot() {
  const { clinicId } = useClinic();
  const [tab, setTab] = useState("copilot");
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hello! I'm your AI Clinic Copilot. I can help you understand your clinic's performance, identify revenue opportunities, analyze patient trends, and provide actionable recommendations. What would you like to know?"
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [clinicData, setClinicData] = useState(null);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!clinicId) return;
    const fetchClinicData = async () => {
      try {
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
        setClinicData({ totalPatients: patients.length, activePatients, totalRevenue, collectionRate, deniedCount: deniedClaims.length, deniedAmount: deniedClaims.reduce((s, c) => s + (Number(c.amount_billed) || 0), 0), noShowRate, totalClaims: claims.length, todayAppts: appts.filter(a => new Date(a.appointment_date).toDateString() === new Date().toDateString()).length });
      } catch (e) { console.error("Failed to load clinic data:", e); }
    };
    fetchClinicData();
  }, [clinicId]);

  const buildDataSection = useCallback(() => clinicData
    ? `Live clinic data:\n- Patients: ${clinicData.totalPatients} (${clinicData.activePatients} active)\n- Revenue: $${clinicData.totalRevenue.toLocaleString()}\n- Collection rate: ${clinicData.collectionRate}%\n- No-show rate: ${clinicData.noShowRate}%\n- Denied claims: ${clinicData.deniedCount} ($${clinicData.deniedAmount.toLocaleString()})\n- Total claims: ${clinicData.totalClaims}`
    : "Clinic data loading...", [clinicData]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);
    const ctx = messages.slice(-6).map(m => `${m.role}: ${m.content}`).join("\n");
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI Clinic Operations Copilot for ClinicOS AI.\n\n${buildDataSection()}\n\nPrevious conversation:\n${ctx}\n\nUser question: ${text}\n\nProvide a helpful, data-driven response with specific numbers and actionable recommendations. Use markdown for readability.`,
      });
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "I encountered an error. Please try again.", isError: true }]);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setReportLoading(true);
    setReport(null);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI Business Consultant for a healthcare clinic. Generate an executive summary report.\n\n${buildDataSection()}\n\nProvide:\n1. **Key Wins** — what's working well\n2. **Top 3 Risks** — what needs attention\n3. **Revenue Opportunities** — specific actions to increase collections\n4. **Strategic Recommendation** — one priority for the next 30 days\n\nBe specific with numbers. Use markdown. Keep it executive-level and under 400 words.`,
      });
      setReport(typeof result === "string" ? result : result?.text || "");
    } catch (e) {
      setReport("Report generation failed: " + (e.message || "Please try again."));
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="max-w-[960px] mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
          <BrainCircuit className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-bold">AI Command Center</h1>
          <p className="text-sm text-muted-foreground">
            {clinicData ? "Connected to your live clinic data" : "Your intelligent practice advisor"}
          </p>
        </div>
        {clinicData && (
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <Badge className="bg-emerald-100 text-emerald-700 text-xs">
              {clinicData.totalPatients} patients
            </Badge>
            <Badge className="bg-primary/10 text-primary text-xs">
              {clinicData.collectionRate}% collection
            </Badge>
            {clinicData.deniedCount > 0 && (
              <Badge className="bg-red-100 text-red-700 text-xs">
                {clinicData.deniedCount} denied claims
              </Badge>
            )}
          </div>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="copilot" className="gap-2">
            <BrainCircuit className="w-4 h-4" /> AI Copilot
          </TabsTrigger>
          <TabsTrigger value="consultant" className="gap-2">
            <Briefcase className="w-4 h-4" /> Business Consultant
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* ── COPILOT TAB ── */}
      {tab === "copilot" && (
        <div className="h-[calc(100vh-240px)] flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      {msg.isError ? <AlertCircle className="w-4 h-4 text-destructive" /> : <BrainCircuit className="w-4 h-4 text-primary" />}
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "bg-primary text-primary-foreground" : msg.isError ? "bg-destructive/10 border border-destructive/20" : "bg-card border border-border"}`}>
                    {msg.role === "user" ? (
                      <p className="text-sm">{msg.content}</p>
                    ) : (
                      <ReactMarkdown className="text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                </div>
                <div className="bg-card border border-border rounded-2xl px-4 py-3">
                  <p className="text-sm text-muted-foreground">Analyzing your clinic data...</p>
                </div>
              </motion.div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {COPILOT_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-2 rounded-full border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground">
                  <Sparkles className="w-3 h-3 inline mr-1.5 text-primary" />{q}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2 bg-card rounded-2xl border border-border p-2">
            <Input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !loading && sendMessage(input)}
              placeholder="Ask about your clinic performance..."
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
              disabled={loading} />
            <Button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} size="icon" className="rounded-xl shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── CONSULTANT TAB ── */}
      {tab === "consultant" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-heading font-semibold text-lg">Executive Business Report</h2>
              <p className="text-sm text-muted-foreground">AI-generated analysis based on your live clinic data</p>
            </div>
            <Button onClick={generateReport} disabled={reportLoading} className="gap-2">
              {reportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {reportLoading ? "Generating..." : report ? "Regenerate Report" : "Generate Report"}
            </Button>
          </div>

          {/* Quick stat cards */}
          {clinicData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Active Patients", value: clinicData.activePatients, icon: Target, color: "text-primary bg-primary/10" },
                { label: "Collection Rate", value: `${clinicData.collectionRate}%`, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
                { label: "Denied Claims", value: clinicData.deniedCount, icon: AlertTriangle, color: "text-amber-600 bg-amber-50" },
                { label: "At-Risk Revenue", value: `$${(clinicData.deniedAmount / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-red-600 bg-red-50" },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl border border-border p-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                    <s.icon className="w-4 h-4" />
                  </div>
                  <p className="text-xl font-heading font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Quick prompts */}
          {!report && !reportLoading && (
            <div>
              <p className="text-sm text-muted-foreground mb-3">Quick insights:</p>
              <div className="flex flex-wrap gap-2">
                {CONSULTANT_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => { setTab("copilot"); setTimeout(() => sendMessage(q), 100); }}
                    className="text-xs px-3 py-2 rounded-full border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground">
                    <Sparkles className="w-3 h-3 inline mr-1.5 text-primary" />{q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {reportLoading && (
            <div className="bg-card rounded-2xl border border-border p-12 flex flex-col items-center gap-4 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm">Analyzing your clinic data and generating executive report...</p>
            </div>
          )}

          {report && !reportLoading && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl border border-border p-6">
              <ReactMarkdown className="prose prose-sm max-w-none text-foreground [&>h2]:font-heading [&>h2]:font-bold [&>h2]:text-base [&>h2]:mt-5 [&>h2]:mb-2 [&>p]:text-sm [&>ul]:text-sm [&>ul]:space-y-1">
                {report}
              </ReactMarkdown>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
