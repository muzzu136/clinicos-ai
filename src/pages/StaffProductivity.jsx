import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users, Phone, Calendar, DollarSign, TrendingUp,
  AlertTriangle, CheckCircle2, Clock, Award, Target
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from "recharts";

const staff = [
  { name: "Jennifer Mills", role: "Front Desk", calls: 142, booked: 98, responseTime: "1.2m", collections: 18400, score: 94, trend: "up" },
  { name: "Carlos Rivera", role: "Medical Biller", calls: 0, booked: 0, responseTime: "—", collections: 84200, score: 91, trend: "up" },
  { name: "Patricia Wong", role: "Care Coordinator", calls: 87, booked: 71, responseTime: "2.1m", collections: 12800, score: 88, trend: "stable" },
  { name: "Thomas Baker", role: "Front Desk", calls: 108, booked: 72, responseTime: "3.4m", collections: 14100, score: 76, trend: "down" },
  { name: "Angela Scott", role: "Practice Manager", calls: 34, booked: 28, responseTime: "0.8m", collections: 22600, score: 96, trend: "up" },
];

const weeklyPerf = [
  { day: "Mon", calls: 48, booked: 34, resolved: 41 },
  { day: "Tue", calls: 62, booked: 47, resolved: 55 },
  { day: "Wed", calls: 54, booked: 39, resolved: 48 },
  { day: "Thu", calls: 71, booked: 58, resolved: 63 },
  { day: "Fri", calls: 43, booked: 32, resolved: 38 },
];

const bottlenecks = [
  { issue: "High response time on insurance verification calls", staff: "Thomas Baker", severity: "high", impact: "$4,200 revenue at risk" },
  { issue: "Low booking conversion rate (67%)", staff: "Thomas Baker", severity: "high", impact: "Est. 8 missed appointments/wk" },
  { issue: "Claims resubmission backlog — 14 pending", staff: "Carlos Rivera", severity: "medium", impact: "$12,800 outstanding" },
  { issue: "After-hours calls not being returned same day", staff: "Team", severity: "medium", impact: "Est. 5 leads/wk lost" },
];

const trendData = [
  { week: "Wk 1", score: 82 },
  { week: "Wk 2", score: 85 },
  { week: "Wk 3", score: 80 },
  { week: "Wk 4", score: 88 },
  { week: "Wk 5", score: 91 },
  { week: "Wk 6", score: 89 },
];

const trendIcon = { up: "↑", down: "↓", stable: "→" };
const trendColor = { up: "text-emerald-600", down: "text-red-500", stable: "text-amber-500" };

export default function StaffProductivity() {
  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-heading font-bold">Staff Productivity Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">AI-powered performance tracking, bottleneck detection & coaching</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Team Efficiency Score", value: "88%", icon: Award, color: "bg-primary/10 text-primary" },
          { label: "Calls Handled Today", value: "278", icon: Phone, color: "bg-sky-50 text-sky-600" },
          { label: "Booking Conversion", value: "71%", icon: Calendar, color: "bg-emerald-50 text-emerald-600" },
          { label: "Avg Response Time", value: "1.9m", icon: Clock, color: "bg-amber-50 text-amber-600" },
          { label: "Bottlenecks Detected", value: "4", icon: AlertTriangle, color: "bg-red-50 text-red-500" },
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
          <TabsTrigger value="overview">Team Overview</TabsTrigger>
          <TabsTrigger value="bottlenecks">AI Bottlenecks</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-heading font-semibold mb-4">Daily Activity (This Week)</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={weeklyPerf}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid hsl(214,32%,91%)", fontSize: 12 }} />
                  <Bar dataKey="calls" fill="hsl(217,91%,60%)" radius={[4,4,0,0]} name="Calls" />
                  <Bar dataKey="booked" fill="hsl(172,66%,50%)" radius={[4,4,0,0]} name="Booked" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-heading font-semibold mb-4">Staff Performance Scores</h3>
              <div className="space-y-4">
                {staff.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                      {s.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="text-sm font-medium">{s.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">{s.role}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${trendColor[s.trend]}`}>{trendIcon[s.trend]}</span>
                          <span className="text-sm font-bold">{s.score}</span>
                        </div>
                      </div>
                      <Progress value={s.score} className="h-1.5" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Staff Table */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="font-heading font-semibold">Individual Metrics</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-4 font-medium text-muted-foreground">Staff Member</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Calls Handled</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Appointments Booked</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Avg Response Time</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Collections</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/20">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.role}</p>
                        </div>
                      </td>
                      <td className="p-4">{s.calls || "—"}</td>
                      <td className="p-4">{s.booked || "—"}</td>
                      <td className="p-4">{s.responseTime}</td>
                      <td className="p-4 font-medium">${s.collections.toLocaleString()}</td>
                      <td className="p-4">
                        <Badge className={s.score >= 90 ? "bg-emerald-100 text-emerald-700" : s.score >= 80 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}>
                          {s.score}/100
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}

      {tab === "bottlenecks" && (
        <div className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">AI Bottleneck Analysis</p>
              <p className="text-xs text-muted-foreground mt-0.5">Automatically detected from call recordings, booking data, and collection reports.</p>
            </div>
          </div>

          {bottlenecks.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
              <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${b.severity === "high" ? "text-red-500" : "text-amber-500"}`} />
              <div className="flex-1">
                <p className="font-medium text-sm">{b.issue}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-muted-foreground">Staff: <span className="font-medium text-foreground">{b.staff}</span></span>
                  <span className="text-xs text-muted-foreground">Impact: <span className="font-medium text-red-500">{b.impact}</span></span>
                </div>
              </div>
              <Badge className={b.severity === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}>
                {b.severity}
              </Badge>
            </motion.div>
          ))}

          {/* AI Recommendations */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              AI Coaching Recommendations
            </h3>
            <div className="space-y-3">
              {[
                "Schedule a 30-min training session with Thomas Baker on booking objection handling — estimated +6 bookings/week.",
                "Consider redistributing 20% of Thomas's call volume to Angela Scott during peak hours.",
                "Implement automated insurance pre-verification 48 hours before appointments to reduce call time by ~35%.",
                "Set up after-hours SMS auto-response to capture missed leads before next business day.",
              ].map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <span className="text-primary font-bold text-sm shrink-0">{i + 1}.</span>
                  <p className="text-sm">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "trends" && (
        <div className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading font-semibold mb-4">Team Efficiency Score — 6-Week Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" vertical={false} />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} />
              <YAxis domain={[70, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid hsl(214,32%,91%)", fontSize: 12 }} />
              <Line type="monotone" dataKey="score" stroke="hsl(217,91%,60%)" strokeWidth={2.5} dot={{ fill: "hsl(217,91%,60%)", r: 5 }} name="Efficiency Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}