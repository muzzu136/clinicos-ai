import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Send, Sparkles, Loader2, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";

const suggestedQuestions = [
  "Why did revenue decrease this week?",
  "Which provider is most profitable?",
  "How many patients are overdue for follow-up?",
  "Which denied claims should be prioritized?",
  "What's our no-show rate trend?",
  "Recommend ways to increase collections",
];

export default function AICopilot() {
  const { clinicId } = useClinic();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI Clinic Copilot. I can help you understand your clinic's performance, identify revenue opportunities, analyze patient trends, and provide actionable recommendations. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [clinicData, setClinicData] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch real clinic KPIs to inject into prompts
  useEffect(() => {
    const fetchClinicData = async () => {
      if (!clinicId) return;
      try {
        const [patientsRes, claimsRes, apptRes] = await Promise.allSettled([
          base44.functions.invoke("awsPatients", { action: "list", clinic_id: clinicId }),
          base44.functions.invoke("awsClaims", { action: "list", clinic_id: clinicId }),
          base44.functions.invoke("awsAppointments", { action: "list", clinic_id: clinicId }),
        ]);

        const patients = patientsRes.status === "fulfilled"
          ? (Array.isArray(patientsRes.value.data) ? patientsRes.value.data : patientsRes.value.data?.patients || [])
          : [];
        const claims = claimsRes.status === "fulfilled"
          ? (Array.isArray(claimsRes.value.data) ? claimsRes.value.data : claimsRes.value.data?.claims || [])
          : [];
        const appts = apptRes.status === "fulfilled"
          ? (Array.isArray(apptRes.value.data) ? apptRes.value.data : apptRes.value.data?.appointments || [])
          : [];

        const activePatients = patients.filter(p => p.status === "active").length;
        const totalRevenue = patients.reduce((sum, p) => sum + (p.total_revenue || 0), 0);
        const deniedClaims = claims.filter(c => c.status === "denied");
        const paidClaims = claims.filter(c => c.status === "paid").length;
        const collectionRate = claims.length > 0 ? Math.round((paidClaims / claims.length) * 100) : 0;
        const today = new Date().toDateString();
        const todayAppts = appts.filter(a => new Date(a.appointment_date).toDateString() === today);
        const noShows = appts.filter(a => a.status === "no_show").length;
        const noShowRate = appts.length > 0 ? Math.round((noShows / appts.length) * 100) : 0;

        setClinicData({
          totalPatients: patients.length,
          activePatients,
          totalRevenue,
          collectionRate,
          deniedClaimsCount: deniedClaims.length,
          deniedClaimsAmount: deniedClaims.reduce((s, c) => s + (c.amount_billed || 0), 0),
          totalClaims: claims.length,
          noShowRate,
          todayAppts: todayAppts.length,
        });
      } catch (e) {
        console.error("Failed to load clinic data for copilot:", e);
      }
    };
    fetchClinicData();
  }, [clinicId]);

  const buildPrompt = useCallback((text, conversationContext) => {
    const dataSection = clinicData
      ? `You have access to this clinic's REAL live data:
- Total patients: ${clinicData.totalPatients} (${clinicData.activePatients} active)
- Total revenue: $${clinicData.totalRevenue.toLocaleString()}
- Collection rate: ${clinicData.collectionRate}%
- No-show rate: ${clinicData.noShowRate}%
- Denied claims: ${clinicData.deniedClaimsCount} (totaling $${clinicData.deniedClaimsAmount.toLocaleString()})
- Total claims: ${clinicData.totalClaims}
- Today's appointments: ${clinicData.todayAppts}`
      : `Note: Clinic data is still loading. Provide general healthcare operations advice.`;

    return `You are an AI Clinic Operations Copilot for ClinicOS AI. You help clinic administrators understand their practice performance, revenue, patient retention, claims, and operations.

${dataSection}

Previous conversation:
${conversationContext}

User question: ${text}

Provide a helpful, data-driven response. Use specific numbers and actionable recommendations. Format with markdown for readability. Keep responses concise but thorough.`;
  }, [clinicData]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const conversationContext = messages.slice(-6).map(m => `${m.role}: ${m.content}`).join("\n");

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: buildPrompt(text, conversationContext),
      });
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (err) {
      console.error("AI Copilot error:", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I encountered an error processing your request. Please try again in a moment.",
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto h-[calc(100vh-112px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
          <BrainCircuit className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">AI Clinic Copilot</h1>
          <p className="text-sm text-muted-foreground">
            {clinicData ? "Connected to your live clinic data" : "Your intelligent practice advisor"}
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                  {msg.isError ? <AlertCircle className="w-4 h-4 text-destructive" /> : <BrainCircuit className="w-4 h-4 text-primary" />}
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : msg.isError
                    ? "bg-destructive/10 border border-destructive/20"
                    : "bg-card border border-border"
              }`}>
                {msg.role === "user" ? (
                  <p className="text-sm">{msg.content}</p>
                ) : (
                  <ReactMarkdown className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
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

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              className="text-xs px-3 py-2 rounded-full border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-foreground"
            >
              <Sparkles className="w-3 h-3 inline mr-1.5 text-primary" />
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 bg-card rounded-2xl border border-border p-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage(input)}
          placeholder="Ask about your clinic performance..."
          className="border-0 shadow-none focus-visible:ring-0 bg-transparent"
          disabled={loading}
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          size="icon"
          className="rounded-xl shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
