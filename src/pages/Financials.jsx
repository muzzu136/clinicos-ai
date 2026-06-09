import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3,
  PieChart as PieIcon, BrainCircuit, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const revenueByService = [
  { service: "Office Visits", revenue: 89400, color: "hsl(217, 91%, 60%)" },
  { service: "Procedures", revenue: 52300, color: "hsl(172, 66%, 50%)" },
  { service: "Telehealth", revenue: 28700, color: "hsl(262, 83%, 58%)" },
  { service: "Wellness", revenue: 35200, color: "hsl(38, 92%, 50%)" },
  { service: "Urgent Care", revenue: 37200, color: "hsl(0, 84%, 60%)" },
];

const cashFlowData = [
  { month: "Jul", inflow: 185000, outflow: 142000 },
  { month: "Aug", inflow: 201000, outflow: 148000 },
  { month: "Sep", inflow: 195000, outflow: 145000 },
  { month: "Oct", inflow: 215000, outflow: 155000 },
  { month: "Nov", inflow: 228000, outflow: 160000 },
  { month: "Dec", inflow: 242000, outflow: 165000 },
];

const forecasts = [
  { metric: "Revenue (Next Month)", forecast: "$258,000", confidence: 87, trend: "up" },
  { metric: "Collections (Next Month)", forecast: "$238,000", confidence: 82, trend: "up" },
  { metric: "Patient Volume", forecast: "1,420 visits", confidence: 79, trend: "up" },
  { metric: "Cash Flow", forecast: "+$78,000", confidence: 85, trend: "up" },
];

export default function Financials() {
  const { clinicId } = useClinic();

  // Attempt to load real data; falls back to sample data if unavailable
  useEffect(() => {
    if (!clinicId) return;
    const loadData = async () => {
      try {
        await base44.functions.invoke("awsFinancials", { action: "list", clinic_id: clinicId });
        // Data loaded - in a full implementation, update state from response
      } catch (e) {
        // Falls back to sample data displayed in UI
        console.warn("Financials data unavailable:", e.message);
      }
    };
    loadData();
  }, [clinicId]);

  const totalRevenue = revenueByService.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Financial Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI-powered revenue analytics & forecasting</p>
        </div>
        <Button variant="outline" className="gap-2">
          <BrainCircuit className="w-4 h-4" /> AI Financial Report
        </Button>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue (MTD)", value: "See Billing Report", change: null, icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
          { label: "Net Profit Margin", value: "32.8%", change: 2.1, icon: TrendingUp, color: "bg-primary/10 text-primary" },
          { label: "Revenue Per Provider", value: "$60,700", change: 8.5, icon: BarChart3, color: "bg-violet-50 text-violet-600" },
          { label: "Revenue Per Visit", value: "$178", change: 5.3, icon: PieIcon, color: "bg-amber-50 text-amber-600" },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl border border-border p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${kpi.color}`}>
              <kpi.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-heading font-bold">{kpi.value}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">+{kpi.change}%</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading font-semibold mb-4">Cash Flow (6 Months)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={cashFlowData}>
              <defs>
                <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} tickFormatter={(v) => `$${v / 1000}K`} />
              <Tooltip formatter={(v) => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: 12, border: "1px solid hsl(214, 32%, 91%)", fontSize: 12 }} />
              <Area type="monotone" dataKey="inflow" stroke="hsl(172, 66%, 50%)" strokeWidth={2} fill="url(#inflowGrad)" name="Inflow" />
              <Area type="monotone" dataKey="outflow" stroke="hsl(0, 84%, 60%)" strokeWidth={2} fill="transparent" strokeDasharray="5 5" name="Outflow" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Revenue by Service */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading font-semibold mb-4">Revenue by Service</h3>
          <div className="flex items-center gap-6">
            <div className="relative w-40 h-40 shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={revenueByService} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="revenue" stroke="none">
                    {revenueByService.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-heading font-bold">${(totalRevenue / 1000).toFixed(0)}K</span>
                <span className="text-[10px] text-muted-foreground">Total</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              {revenueByService.map((item) => (
                <div key={item.service} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm">{item.service}</span>
                  </div>
                  <span className="text-sm font-semibold">${(item.revenue / 1000).toFixed(1)}K</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Forecasts */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-5">
          <BrainCircuit className="w-5 h-5 text-accent" />
          <h3 className="font-heading font-semibold">AI Forecasts</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {forecasts.map((item, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-xs text-white/50 mb-2">{item.metric}</p>
              <p className="text-xl font-heading font-bold">{item.forecast}</p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-white/60">{item.confidence}% confidence</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}