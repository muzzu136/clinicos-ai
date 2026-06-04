import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import {
  DollarSign, AlertTriangle, FileText, TrendingUp,
  ArrowRight, CheckCircle2, XCircle, Clock, BrainCircuit
} from "lucide-react";

const arData = [
  { bucket: "0-30 days", amount: 128500, count: 145, color: "hsl(172, 66%, 50%)" },
  { bucket: "31-60 days", amount: 67200, count: 82, color: "hsl(217, 91%, 60%)" },
  { bucket: "61-90 days", amount: 34800, count: 38, color: "hsl(38, 92%, 50%)" },
  { bucket: "90+ days", amount: 22100, count: 23, color: "hsl(0, 84%, 60%)" },
];

const denialReasons = [
  { reason: "Missing Documentation", count: 12, amount: 18400, recoverable: 15200 },
  { reason: "Coding Errors", count: 8, amount: 12300, recoverable: 11800 },
  { reason: "Prior Auth Required", count: 5, amount: 9800, recoverable: 7500 },
  { reason: "Eligibility Issues", count: 4, amount: 5200, recoverable: 3800 },
  { reason: "Timely Filing", count: 2, amount: 3400, recoverable: 0 },
];

const payerPerformance = [
  { payer: "BlueCross", claims: 120, paidRate: 94, avgDays: 18, denial: 4.2 },
  { payer: "Aetna", claims: 95, paidRate: 91, avgDays: 22, denial: 6.1 },
  { payer: "UnitedHealth", claims: 88, paidRate: 89, avgDays: 25, denial: 7.8 },
  { payer: "Cigna", claims: 72, paidRate: 92, avgDays: 20, denial: 5.3 },
  { payer: "Humana", claims: 54, paidRate: 87, avgDays: 28, denial: 9.2 },
];

export default function RevenueCycle() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Revenue Cycle Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">AI-powered claims, collections & revenue optimization</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Total A/R", value: "$252,600", icon: DollarSign, color: "bg-primary/10 text-primary" },
          { label: "Collection Rate", value: "94.2%", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
          { label: "Denied Claims", value: "31", icon: XCircle, color: "bg-red-50 text-red-500" },
          { label: "Avg Days to Pay", value: "21", icon: Clock, color: "bg-amber-50 text-amber-600" },
          { label: "Recoverable", value: "$38,300", icon: BrainCircuit, color: "bg-violet-50 text-violet-600" },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${kpi.color}`}>
              <kpi.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-heading font-bold">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="ar">
        <TabsList>
          <TabsTrigger value="ar">A/R Aging</TabsTrigger>
          <TabsTrigger value="denials">Denial Management</TabsTrigger>
          <TabsTrigger value="payers">Payer Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="ar" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-heading font-semibold mb-4">Accounts Receivable by Age</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={arData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
                  <XAxis dataKey="bucket" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} tickFormatter={(v) => `$${v / 1000}K`} />
                  <Tooltip formatter={(v) => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: 12, border: "1px solid hsl(214, 32%, 91%)", fontSize: 12 }} />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {arData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-heading font-semibold mb-4">A/R Breakdown</h3>
              <div className="space-y-4">
                {arData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium">{item.bucket}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-sm text-muted-foreground">{item.count} claims</span>
                      <span className="text-sm font-semibold w-24 text-right">${item.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                <div className="border-t pt-3 flex items-center justify-between font-semibold">
                  <span>Total Outstanding</span>
                  <span>${arData.reduce((s, d) => s + d.amount, 0).toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="denials" className="mt-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-semibold">Denial Analysis</h3>
              <Button size="sm" className="gap-2">
                <BrainCircuit className="w-4 h-4" /> AI Appeal All Eligible
              </Button>
            </div>
            <div className="space-y-3">
              {denialReasons.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/20 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.reason}</p>
                    <p className="text-xs text-muted-foreground">{item.count} claims · ${item.amount.toLocaleString()} billed</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">${item.recoverable.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">recoverable</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary gap-1">
                    Appeal <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="payers" className="mt-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="font-heading font-semibold">Payer Performance Ranking</h3>
              <p className="text-xs text-muted-foreground mt-1">AI-ranked by overall performance</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 text-xs text-muted-foreground">
                    <th className="text-left p-4 font-medium">Rank</th>
                    <th className="text-left p-4 font-medium">Payer</th>
                    <th className="text-left p-4 font-medium">Claims</th>
                    <th className="text-left p-4 font-medium">Paid Rate</th>
                    <th className="text-left p-4 font-medium">Avg Days</th>
                    <th className="text-left p-4 font-medium">Denial Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {payerPerformance.map((payer, i) => (
                    <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-sm">{payer.payer}</td>
                      <td className="p-4 text-sm text-muted-foreground">{payer.claims}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Progress value={payer.paidRate} className="h-1.5 w-20" />
                          <span className="text-xs font-medium">{payer.paidRate}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{payer.avgDays} days</td>
                      <td className="p-4">
                        <Badge className={payer.denial > 7 ? "bg-red-100 text-red-700" : payer.denial > 5 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}>
                          {payer.denial}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}