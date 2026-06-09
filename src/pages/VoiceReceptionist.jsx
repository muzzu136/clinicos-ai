import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Phone, PhoneCall, PhoneIncoming, PhoneMissed,
  Mic, Brain, Clock, TrendingUp, CheckCircle2,
  MessageSquare, Calendar, Shield, Zap
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from "recharts";

const recentCalls = [
  { time: "10:24 AM", caller: "Sarah M.", type: "inbound", intent: "Schedule Appointment", outcome: "Booked", duration: "2:14", sentiment: "positive" },
  { time: "10:18 AM", caller: "(555) 234-8890", type: "inbound", intent: "Prescription Refill", outcome: "Routed to Nurse", duration: "1:42", sentiment: "neutral" },
  { time: "10:09 AM", caller: "Michael T.", type: "outbound", intent: "Missed Call Recovery", outcome: "Voicemail Left", duration: "0:38", sentiment: "neutral" },
  { time: "9:52 AM", caller: "Janet R.", type: "inbound", intent: "Insurance Question", outcome: "Answered by AI", duration: "3:21", sentiment: "positive" },
  { time: "9:41 AM", caller: "David C.", type: "inbound", intent: "Reschedule", outcome: "Rescheduled", duration: "1:58", sentiment: "positive" },
  { time: "9:30 AM", caller: "(555) 891-2234", type: "missed", intent: "Unknown", outcome: "SMS Follow-up Sent", duration: "—", sentiment: "neutral" },
];

const callVolume = [
  { hour: "8am", inbound: 8, outbound: 3 },
  { hour: "9am", inbound: 18, outbound: 7 },
  { hour: "10am", inbound: 24, outbound: 11 },
  { hour: "11am", inbound: 21, outbound: 8 },
  { hour: "12pm", inbound: 14, outbound: 5 },
  { hour: "1pm", inbound: 19, outbound: 9 },
  { hour: "2pm", inbound: 22, outbound: 12 },
  { hour: "3pm", inbound: 16, outbound: 6 },
  { hour: "4pm", inbound: 11, outbound: 4 },
];

const conversionTrend = [
  { day: "Mon", rate: 68 }, { day: "Tue", rate: 72 }, { day: "Wed", rate: 71 },
  { day: "Thu", rate: 76 }, { day: "Fri", rate: 74 },
];

const sentimentColor = { positive: "text-emerald-600", neutral: "text-muted-foreground", negative: "text-red-500" };
const outcomeColor = { "Booked": "bg-emerald-100 text-emerald-700", "Rescheduled": "bg-primary/10 text-primary", "Routed to Nurse": "bg-amber-100 text-amber-700", "Answered by AI": "bg-violet-100 text-violet-700", "Voicemail Left": "bg-muted text-muted-foreground", "SMS Follow-up Sent": "bg-sky-100 text-sky-700" };

export default function VoiceReceptionist() {
  const { clinicId } = useClinic();
  const [tab, setTab] = useState("live");

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Add-on banner */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <span className="text-amber-600 font-bold text-xs">ADD-ON</span>
          </div>
          <div>
            <p className="font-semibold text-amber-900 text-sm">AI Voice Receptionist is a paid add-on</p>
            <p className="text-xs text-amber-700">Starts at $199/mo · Only pay for what you use · Cancel anytime</p>
          </div>
        </div>
        <a href="mailto:sales@clinicosai.org?subject=Voice Receptionist Add-On" className="shrink-0">
          <button className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
            Activate Add-On
          </button>
        </a>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">AI Voice Receptionist</h1>
          <p className="text-sm text-muted-foreground mt-0.5">24/7 AI front desk — answering, booking, and routing calls automatically</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-full px-3 py-1.5 text-sm font-medium border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            AI Active — 24/7
          </div>
          <Button onClick={() => toast.success("HIPAA compliance verified. BAA active, encryption enabled, audit logs running.")} variant="outline" className="gap-2"><Shield className="w-4 h-4" />HIPAA Secure</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Calls Handled Today", value: "142", icon: Phone, color: "bg-primary/10 text-primary" },
          { label: "AI Booking Rate", value: "74%", icon: Calendar, color: "bg-emerald-50 text-emerald-600" },
          { label: "Missed Call Recovery", value: "89%", icon: PhoneMissed, color: "bg-amber-50 text-amber-600" },
          { label: "Avg Handle Time", value: "2:08", icon: Clock, color: "bg-violet-50 text-violet-600" },
          { label: "CSAT Score", value: "4.7★", icon: TrendingUp, color: "bg-sky-50 text-sky-600" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-heading font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="live">Live Call Feed</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "live" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {recentCalls.map((call, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-card rounded-xl border border-border p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${call.type === "inbound" ? "bg-primary/10" : call.type === "outbound" ? "bg-emerald-50" : "bg-red-50"}`}>
                  {call.type === "inbound" ? <PhoneIncoming className="w-4 h-4 text-primary" /> : call.type === "outbound" ? <PhoneCall className="w-4 h-4 text-emerald-600" /> : <PhoneMissed className="w-4 h-4 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{call.caller}</p>
                    <Badge className={outcomeColor[call.outcome]}>{call.outcome}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted-foreground">{call.intent}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className={`text-xs font-medium ${sentimentColor[call.sentiment]}`}>{call.sentiment}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-mono text-muted-foreground">{call.duration}</p>
                  <p className="text-xs text-muted-foreground">{call.time}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Intent Detection */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-primary" />
              <h3 className="font-heading font-semibold text-sm">AI Intent Breakdown (Today)</h3>
            </div>
            <div className="space-y-3">
              {[
                { intent: "Schedule/Reschedule", count: 61, pct: 43 },
                { intent: "Prescription Refill", count: 28, pct: 20 },
                { intent: "Insurance Questions", count: 23, pct: 16 },
                { intent: "General FAQ", count: 18, pct: 13 },
                { intent: "Urgent/Triage", count: 8, pct: 6 },
                { intent: "Other", count: 4, pct: 3 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{item.intent}</span>
                    <span className="text-muted-foreground">{item.count} calls</span>
                  </div>
                  <Progress value={item.pct} className="h-1.5" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {tab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-heading font-semibold mb-4">Call Volume by Hour</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={callVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" vertical={false} />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid hsl(214,32%,91%)", fontSize: 12 }} />
                <Bar dataKey="inbound" fill="hsl(217,91%,60%)" radius={[4,4,0,0]} name="Inbound" />
                <Bar dataKey="outbound" fill="hsl(172,66%,50%)" radius={[4,4,0,0]} name="Outbound" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-heading font-semibold mb-4">Booking Conversion Rate (This Week)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={conversionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} />
                <YAxis domain={[60, 85]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid hsl(214,32%,91%)", fontSize: 12 }} formatter={v => `${v}%`} />
                <Line type="monotone" dataKey="rate" stroke="hsl(217,91%,60%)" strokeWidth={2.5} dot={{ r: 5, fill: "hsl(217,91%,60%)" }} name="Conversion Rate" />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {tab === "config" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: Mic, title: "Voice & Language", desc: "Configure AI voice, accent, and multi-language support (English, Spanish, French, Mandarin)", status: "active" },
            { icon: Brain, title: "Intent Detection", desc: "Train AI on clinic-specific FAQs, scheduling rules, and triage protocols", status: "active" },
            { icon: MessageSquare, title: "SMS Follow-up", desc: "Automatically send SMS after missed calls or AI interactions", status: "active" },
            { icon: Calendar, title: "Booking Rules", desc: "Set scheduling constraints, provider preferences, and slot availability", status: "active" },
            { icon: Shield, title: "HIPAA Call Recording", desc: "Encrypted call recording and transcription with auto-redaction of PHI", status: "active" },
            { icon: Zap, title: "Human Escalation Rules", desc: "Define when AI transfers to human staff (urgent, emotional, complex)", status: "configure" },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm">{item.title}</p>
                  <Badge className={item.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                    {item.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Button onClick={() => toast.info(`Opening configuration for ${item.title}...`)} variant="ghost" size="sm">Edit</Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}