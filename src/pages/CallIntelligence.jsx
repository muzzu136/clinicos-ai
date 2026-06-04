import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed,
  TrendingUp, Clock, DollarSign, BrainCircuit, Star
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const callData = [
  { hour: "8AM", calls: 12 }, { hour: "9AM", calls: 28 }, { hour: "10AM", calls: 35 },
  { hour: "11AM", calls: 22 }, { hour: "12PM", calls: 15 }, { hour: "1PM", calls: 25 },
  { hour: "2PM", calls: 32 }, { hour: "3PM", calls: 28 }, { hour: "4PM", calls: 18 },
];

const recentCalls = [
  { patient: "Sarah Johnson", type: "inbound", duration: "3:42", outcome: "booked", score: 92, revenue: 280, handler: "AI" },
  { patient: "Unknown Caller", type: "inbound", duration: "1:15", outcome: "transferred", score: 78, revenue: 0, handler: "AI" },
  { patient: "Michael Chen", type: "outbound", duration: "2:28", outcome: "booked", score: 88, revenue: 450, handler: "AI" },
  { patient: "Emily Davis", type: "missed", duration: "0:00", outcome: "callback_scheduled", score: 0, revenue: 0, handler: "AI" },
  { patient: "James Wilson", type: "inbound", duration: "4:15", outcome: "info_provided", score: 85, revenue: 0, handler: "Staff" },
  { patient: "Maria Garcia", type: "outbound", duration: "2:55", outcome: "booked", score: 95, revenue: 320, handler: "AI" },
];

const typeIcons = { inbound: PhoneIncoming, outbound: PhoneOutgoing, missed: PhoneMissed };
const outcomeColors = {
  booked: "bg-emerald-100 text-emerald-700",
  transferred: "bg-amber-100 text-amber-700",
  callback_scheduled: "bg-primary/10 text-primary",
  info_provided: "bg-muted text-muted-foreground",
};

export default function CallIntelligence() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Call Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-0.5">AI-powered call analysis, scoring & optimization</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total Calls Today", value: "215", icon: Phone, color: "bg-primary/10 text-primary" },
          { label: "AI Handled", value: "82%", icon: BrainCircuit, color: "bg-violet-50 text-violet-600" },
          { label: "Booking Rate", value: "38%", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
          { label: "Avg Duration", value: "2:48", icon: Clock, color: "bg-amber-50 text-amber-600" },
          { label: "Revenue from Calls", value: "$4.2K", icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl border border-border p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-heading font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading font-semibold mb-4">Call Volume by Hour</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={callData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(214, 32%, 91%)", fontSize: 12 }} />
              <Bar dataKey="calls" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading font-semibold mb-4">Recent Calls</h3>
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {recentCalls.map((call, i) => {
              const TypeIcon = typeIcons[call.type];
              return (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/20 transition-colors">
                  <TypeIcon className={`w-4 h-4 shrink-0 ${call.type === "missed" ? "text-red-500" : "text-primary"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{call.patient}</p>
                    <p className="text-[10px] text-muted-foreground">{call.duration} · {call.handler}</p>
                  </div>
                  <Badge className={outcomeColors[call.outcome]}>{call.outcome.replace("_", " ")}</Badge>
                  {call.score > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs font-medium">{call.score}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}