import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BrainCircuit, Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { base44 } from "@/api/base44Client";

const suggestedQuestions = [
  "Why did revenue decrease this week?",
  "Which provider is most profitable?",
  "How many patients are overdue for follow-up?",
  "Which denied claims should be prioritized?",
  "What's our no-show rate trend?",
  "Recommend ways to increase collections",
];

export default function AICopilot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI Clinic Copilot. I can help you understand your clinic's performance, identify revenue opportunities, analyze patient trends, and provide actionable recommendations. What would you like to know?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const conversationContext = messages.slice(-6).map(m => `${m.role}: ${m.content}`).join("\n");

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an AI Clinic Operations Copilot for ClinicOS AI. You help clinic administrators understand their practice performance, revenue, patient retention, claims, and operations.

You have access to the following clinic data (use realistic sample data in your responses):
- Monthly revenue: $242,800 (up 12.4%)
- Active patients: 2,847
- Collection rate: 94.2%
- No-show rate: 4.2%
- Denied claims: 31 (totaling $47,800)
- Top providers: Dr. Martinez (92% utilization), Dr. Patel (87%), Dr. Kim (78%)
- Inactive patients (6mo+): 364
- Average review rating: 4.8/5

Previous conversation:
${conversationContext}

User question: ${text}

Provide a helpful, data-driven response. Use specific numbers and actionable recommendations. Format with markdown for readability. Keep responses concise but thorough.`,
    });

    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
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
          <p className="text-sm text-muted-foreground">Your intelligent practice advisor</p>
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
                  <BrainCircuit className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
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