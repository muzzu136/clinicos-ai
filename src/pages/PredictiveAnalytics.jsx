import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp, DollarSign, Users, Calendar,
  AlertTriangle, CheckCircle2, BarChart3, Zap
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, BarChart, Bar, ReferenceLine
} from "recharts";

const revenueForecast = [
  { month: "Jan", actual: 218000, forecast: null, lower: null, upper: null },
  { month: "Feb", actual: 224000, forecast: null, lower: null, upper: null },
  { month: "Mar", actual: 231000, forecast: null, lower: null, upper: null },
  { month: "Apr", actual: 228000, forecast: null, lower: null, upper: null },
  { month: "May", actual: 235000, forecast: null, lower: null, upper: null },
  { month: "Jun", actual: 242800, forecast: null, lower: null, upper: null },
  { month: "Jul", actual: null, forecast: 251000, lower: 238000, upper: 264000 },
  { month: "Aug", actual: null, forecast: 258000, lower: 243000, upper: 273000 },
  { month: "Sep", actual: null, forecast: 264000, lower: 247000, upper: 281000 },
  { month: "Oct", actual: null, forecast: 271000, lower: 252000, upper: 290000 },
  { month: "Nov", actual: null, forecast: 279000, lower: 259000, upper: 299000 },
  { month: "Dec", actual: null, forecast: 287000, lower: 265000, upper: 309000 },
];

const demandForecast = [
  { week: "Wk 1", predicted: 232, actual: 228 },
  { week: "Wk 2", predicted: 248, actual: 241 },
  { week: "Wk 3", predicted: 244, actual: 247 },
  { week: "Wk 4", predicted: 256, actual: null },
  { week: "Wk 5", predicted: 261, actual: null },
  { week: "Wk 6", predicted: 268, actual: null },
];

const cashFlow = [
  { month: "Jul", inflow: 258000, outflow: 184000, net: 74000 },
  { month: "Aug", inflow: 265000, outflow: 187000, net: 78000 },
  { month: "Sep", inflow: 271000, outflow: 191000, net: 80000 },
  { month: "Oct", inflow: 278000, outflow: 194000, net: 84000 },
  { month: "Nov", inflow: 285000, outflow: 198000, net: 87000 },
  { month: "Dec", inflow: 293000, outflow: 202000, net: 91000 },
];

const staffingNeeds = [
  { role: "Front Desk", current: 3, predicted: 4, confidence: 88, timeline: "Q3 2026" },
  { role: "Medical Biller", current: 1, predicted: 2, confidence: 79, timeline: "Q4 2026" },
  { role: "Care Coordinator", current: 2, predicted: 2, confidence: 95, timeline: "No change" },
  { role: "Physician (FTE)", current: 4, predicted: 5, confidence: 82, timeline: "Q1 2027" },
];

const risks = [
  { title: "Seasonal demand drop expected in January", impact: "-$18,000 revenue", probability: 72, action: "Launch winter reactivation campaign in Dec" },
  { title: "BlueCross rate negotiation window closing", impact: "$24,000/year at risk", probability: 65, action: "Initiate contract review before Jan 15" },
  { title: "Dr. Kim utilization trending toward burnout", impact: "Provider attrition risk", probability: 58, action: "Add 2 afternoon slots for nurse practitioner" },
  { title: "Claim denial rate trending upward (+1.2%)", impact: "$8,400 AR risk", probability: 81, action: "Audit ICD-10 codes for UnitedHealth claims" },
];

export default function PredictiveAnalytics() {
  const [tab, setTab] = useState("revenue");

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-heading font-bold">Predictive Analytics & Forecasting</h1>
        <p className="text-sm text-muted-foreground mt-0.5">AI-generated forecasts for revenue, demand, staffing, and cash flow</p>
      </div>

      {/* AI Forecast Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Projected Revenue (Jul)", value: "$251K", change: "+3.4%", icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
          { label: "Predicted Appointments (Wk)", value: "256", change: "+2.8%", icon: Calendar, color: "bg-primary/10 text-primary" },
          { label: "Forecasted Net Cash Flow", value: "$74K", change: "+8.1%", icon: TrendingUp, color: "bg-violet-50 text-violet-600" },
          { label: "Risks Identified", value: "4", change: "Action needed", icon: AlertTriangle, color: "bg-red-50 text-red-500" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-heading font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-xs font-medium text-primary mt-1">{stat.change}</p>
          </motion.div>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="revenue">Revenue Forecast</TabsTrigger>
          <TabsTrigger value="demand">Demand Forecast</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="staffing">Staffing</TabsTrigger>
          <TabsTrigger value="risks">Risk Alerts</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "revenue" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-heading font-semibold">12-Month Revenue Forecast</h3>
            <Badge className="bg-primary/10 text-primary">AI Model</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-5">Shaded area shows prediction confidence range. Based on historical data, seasonality, and growth trends.</p>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={revenueForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid hsl(214,32%,91%)", fontSize: 12 }} formatter={v => v ? `$${v.toLocaleString()}` : "—"} />
              <ReferenceLine x="Jun" stroke="hsl(215,16%,47%)" strokeDasharray="4 4" label={{ value: "Today", fontSize: 10, fill: "hsl(215,16%,47%)" }} />
              <Area type="monotone" dataKey="upper" stroke="transparent" fill="hsl(217,91%,60%)" fillOpacity={0.1} name="Upper bound" />
              <Area type="monotone" dataKey="lower" stroke="transparent" fill="hsl(0,0%,100%)" fillOpacity={1} name="Lower bound" />
              <Area type="monotone" dataKey="actual" stroke="hsl(172,66%,50%)" fill="hsl(172,66%,50%)" fillOpacity={0.15} strokeWidth={2.5} name="Actual" />
              <Area type="monotone" dataKey="forecast" stroke="hsl(217,91%,60%)" fill="hsl(217,91%,60%)" fillOpacity={0.15} strokeWidth={2.5} strokeDasharray="5 5" name="Forecast" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {tab === "demand" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading font-semibold mb-1">Appointment Demand Forecast</h3>
          <p className="text-xs text-muted-foreground mb-5">Predicted vs actual weekly appointment volume</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={demandForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" vertical={false} />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid hsl(214,32%,91%)", fontSize: 12 }} />
              <Bar dataKey="actual" fill="hsl(172,66%,50%)" radius={[4,4,0,0]} name="Actual" />
              <Bar dataKey="predicted" fill="hsl(217,91%,60%)" radius={[4,4,0,0]} fillOpacity={0.6} name="Predicted" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {tab === "cashflow" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading font-semibold mb-1">6-Month Cash Flow Forecast</h3>
          <p className="text-xs text-muted-foreground mb-5">Projected inflows, outflows, and net cash position</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cashFlow}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid hsl(214,32%,91%)", fontSize: 12 }} formatter={v => `$${v.toLocaleString()}`} />
              <Bar dataKey="inflow" fill="hsl(172,66%,50%)" radius={[4,4,0,0]} name="Inflow" />
              <Bar dataKey="outflow" fill="hsl(0,84%,60%)" radius={[4,4,0,0]} fillOpacity={0.7} name="Outflow" />
              <Bar dataKey="net" fill="hsl(217,91%,60%)" radius={[4,4,0,0]} name="Net" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {tab === "staffing" && (
        <div className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
            <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm">AI has analyzed patient volume trends and workload data to predict staffing needs over the next 12 months.</p>
          </div>
          {staffingNeeds.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-card rounded-xl border border-border p-5 flex items-center gap-6">
              <div className="flex-1">
                <p className="font-semibold">{s.role}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Recommended hire by: {s.timeline}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{s.current} → {s.predicted}</p>
                <p className="text-xs text-muted-foreground">Current → Predicted</p>
              </div>
              <div className="text-center w-24">
                <p className="text-sm font-bold text-primary">{s.confidence}%</p>
                <p className="text-xs text-muted-foreground">Confidence</p>
              </div>
              <Badge className={s.current < s.predicted ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}>
                {s.current < s.predicted ? "Hire Needed" : "Sufficient"}
              </Badge>
            </motion.div>
          ))}
        </div>
      )}

      {tab === "risks" && (
        <div className="space-y-4">
          {risks.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start gap-4">
                <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${r.probability > 70 ? "text-red-500" : "text-amber-500"}`} />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{r.title}</p>
                  <p className="text-xs text-red-500 font-medium mt-1">Impact: {r.impact}</p>
                  <div className="mt-3 p-3 bg-muted/30 rounded-lg flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm">AI Recommendation: {r.action}</p>
                  </div>
                </div>
                <div className="text-center shrink-0">
                  <p className="text-lg font-bold text-foreground">{r.probability}%</p>
                  <p className="text-xs text-muted-foreground">Probability</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}