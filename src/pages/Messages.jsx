import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Mail, Phone, Send, BrainCircuit, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";

// Fallback sample conversations shown until real data loads
const sampleConversations = [
  { id: 1, name: "Sarah Johnson", lastMessage: "Thank you for the appointment reminder!", channel: "sms", time: "2m ago", unread: true },
  { id: 2, name: "Michael Chen", lastMessage: "Can I reschedule my appointment to Friday?", channel: "email", time: "15m ago", unread: true },
  { id: 3, name: "Emily Davis", lastMessage: "My insurance information has changed.", channel: "sms", time: "1h ago", unread: false },
  { id: 4, name: "James Wilson", lastMessage: "What time does the clinic open on Saturday?", channel: "chat", time: "2h ago", unread: false },
  { id: 5, name: "Maria Garcia", lastMessage: "I need a prescription refill please.", channel: "sms", time: "3h ago", unread: true },
];

const sampleMessages = [
  { role: "patient", text: "Hi, can I reschedule my appointment to Friday?", time: "3:15 PM" },
  { role: "ai_suggestion", text: "Of course! I can see Friday has availability at 10:00 AM, 2:00 PM, and 3:30 PM with Dr. Martinez. Which time works best for you?" },
  { role: "staff", text: "Of course! We have openings at 10:00 AM, 2:00 PM, and 3:30 PM on Friday with Dr. Martinez. Which works best?", time: "3:17 PM" },
  { role: "patient", text: "2:00 PM would be perfect, thank you!", time: "3:19 PM" },
];

const channelIcons = { sms: MessageSquare, email: Mail, chat: MessageSquare, phone: Phone };

export default function Messages() {
  const { clinicId } = useClinic();
  const [conversations, setConversations] = useState(sampleConversations);
  const [messages, setMessages] = useState(sampleMessages);
  const [selected, setSelected] = useState(sampleConversations[1]);
  const [messageText, setMessageText] = useState("");
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [search, setSearch] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch real conversations if available
  useEffect(() => {
    if (!clinicId) return;
    const loadConversations = async () => {
      try {
        const res = await base44.functions.invoke("awsMessages", { action: "list_conversations", clinic_id: clinicId });
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : raw?.conversations || [];
        if (list.length > 0) {
          setConversations(list);
          setSelected(list[0]);
        }
      } catch {
        // Keep sample data on error
      }
    };
    loadConversations();
  }, [clinicId]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!selected?.id || !clinicId) return;
    const loadMessages = async () => {
      try {
        const res = await base44.functions.invoke("awsMessages", {
          action: "list_messages",
          conversation_id: selected.id,
          clinic_id: clinicId,
        });
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : raw?.messages || [];
        if (list.length > 0) setMessages(list);
        else setMessages(sampleMessages);
      } catch {
        setMessages(sampleMessages);
      }
    };
    loadMessages();
  }, [selected?.id, clinicId]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || sendLoading) return;
    const text = messageText.trim();
    setMessageText("");
    const optimisticMsg = { role: "staff", text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
    setMessages(prev => [...prev, optimisticMsg]);
    setSendLoading(true);
    try {
      await base44.functions.invoke("awsMessages", {
        action: "send",
        conversation_id: selected?.id,
        clinic_id: clinicId,
        text,
        channel: selected?.channel || "sms",
      });
    } catch (e) {
      console.error("Failed to send message:", e);
      // Keep optimistic update in UI anyway
    } finally {
      setSendLoading(false);
    }
  };

  const handleAIAssist = async () => {
    setAiLoading(true);
    setShowAIAssist(true);
    try {
      const lastPatientMsg = [...messages].reverse().find(m => m.role === "patient");
      const suggestion = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI assistant for a medical clinic. A patient said: "${lastPatientMsg?.text || ""}". Suggest a professional, empathetic reply that a clinic staff member could send. Keep it brief (2-3 sentences max). Do not use markdown.`,
      });
      setAiSuggestion(typeof suggestion === "string" ? suggestion : suggestion?.text || "");
    } catch {
      setAiSuggestion("AI suggestion unavailable. Please type your response manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const filteredConversations = conversations.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">Communication Hub</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Omnichannel patient messaging with AI assistance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 bg-card rounded-2xl border border-border overflow-hidden" style={{ height: "calc(100vh - 200px)" }}>
        {/* Conversation List */}
        <div className="border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-10 bg-muted/50 border-0"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredConversations.map((conv) => {
              const ChannelIcon = channelIcons[conv.channel] || MessageSquare;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelected(conv)}
                  className={cn(
                    "flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-border",
                    selected?.id === conv.id ? "bg-primary/5" : "hover:bg-muted/50"
                  )}
                >
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {conv.name?.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0,2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={cn("text-sm font-medium truncate", conv.unread && "font-semibold")}>{conv.name}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{conv.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <ChannelIcon className="w-3 h-3 text-muted-foreground shrink-0" />
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                    </div>
                  </div>
                  {conv.unread && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col">
          {selected && (
            <>
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {selected.name?.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0,2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{selected.name}</p>
                    <p className="text-[10px] text-muted-foreground">via {selected.channel?.toUpperCase()}</p>
                  </div>
                </div>
                <Button onClick={handleAIAssist} variant="outline" size="sm" className="gap-1.5 text-xs">
                  <BrainCircuit className="w-3 h-3" /> AI Assist
                </Button>
              </div>

              {showAIAssist && (
                <div className="border-b border-border bg-primary/5 p-4">
                  <div className="flex items-start gap-2">
                    <BrainCircuit className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-primary mb-1">AI Suggested Reply</p>
                      {aiLoading ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 className="w-3 h-3 animate-spin" /> Generating suggestion...
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">{aiSuggestion}</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {aiSuggestion && !aiLoading && (
                        <Button size="sm" variant="outline" className="text-xs h-7"
                          onClick={() => { setMessageText(aiSuggestion); setShowAIAssist(false); }}>
                          Use
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setShowAIAssist(false)}>✕</Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "max-w-[80%]",
                      msg.role === "patient" ? "" : msg.role === "ai_suggestion" ? "mx-auto max-w-[90%]" : "ml-auto"
                    )}
                  >
                    {msg.role === "ai_suggestion" ? (
                      <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <BrainCircuit className="w-3 h-3 text-primary" />
                          <span className="text-[10px] font-semibold text-primary">AI Suggestion</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{msg.text}</p>
                      </div>
                    ) : (
                      <div className={cn(
                        "rounded-2xl px-4 py-2.5",
                        msg.role === "patient" ? "bg-muted" : "bg-primary text-primary-foreground"
                      )}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={cn("text-[10px] mt-1", msg.role === "patient" ? "text-muted-foreground" : "text-primary-foreground/60")}>{msg.time}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    className="bg-muted/50 border-0"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !sendLoading && handleSendMessage()}
                    disabled={sendLoading}
                  />
                  <Button onClick={handleSendMessage} size="icon" className="shrink-0" disabled={sendLoading || !messageText.trim()}>
                    {sendLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
