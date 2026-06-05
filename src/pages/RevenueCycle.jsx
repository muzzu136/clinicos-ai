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
  ArrowRight, CheckCircle2, XCircle, Clock, BrainCircuit,
  ShieldCheck, Search, Zap, RefreshCw, User
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

const scrubIssues = [
  { cpt: "99215", patient: "Emily Davis", issue: "Missing ICD-10 linkage", severity: "error", fix: "Link Z00.00 to 99215" },
  { cpt: "99213", patient: "James Wilson", issue: "Duplicate code — 99213 & 99214 billed same DOS", severity: "error", fix: "Remove duplicate" },
  { cpt: "J0696", patient: "Maria Garcia", issue: "Prior auth code absent on UnitedHealth claim", severity: "warning", fix: "Add auth #UA-8821" },
  { cpt: "99214", patient: "David Brown", issue: "Modifier 25 missing for same-day procedure", severity: "warning", fix: "Append modifier 25" },
  { cpt: "27447", patient: "Robert Lee", issue: "Place of service mismatch (11 vs 21)", severity: "error", fix: "Update POS to 21" },
];

const eligibilityChecks = [
  { patient: "Sarah Johnson", payer: "BlueCross", plan: "PPO Gold", deductible: "$500", met: "$500", copay: "$30", status: "verified", appt: "Today 9:00 AM" },
  { patient: "Tom Harris", payer: "Aetna", plan: "HMO Select", deductible: "$1,500", met: "$320", copay: "$50", status: "verified", appt: "Today 10:30 AM" },
  { patient: "Nina Patel", payer: "Cigna", plan: "HDHP", deductible: "$3,000", met: "$0", copay: "$0", status: "inactive", appt: "Today 11:00 AM" },
  { patient: "Carlos Ruiz", payer: "Humana", plan: "PPO Silver", deductible: "$1,000", met: "$750", copay: "$40", status: "verified", appt: "Tomorrow 9:00 AM" },
  { patient: "Amy Chen", payer: "UnitedHealth", plan: "Choice Plus", deductible: "$2,000", met: "$1,200", copay: "$35", status: "needs_auth", appt: "Tomorrow 2:00 PM" },
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
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="ar">A/R Aging</TabsTrigger>
          <TabsTrigger value="scrubber">Claim Scrubber</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility Check</TabsTrigger>
          <TabsTrigger value="denials">Denial Management</TabsTrigger>
          <TabsTrigger value="payers">Payer Performance</TabsTrigger>
        </TabsList>

        {/* ── Clearinghouse Claim Scrubber ── */}
        <TabsContent value="scrubber" className="mt-4">
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-violet-50 to-primary/5 border border-primary/20 rounded-2xl p-5 flex flex-wrap items-center gap-4 justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-heading font-semibold">AI Clearinghouse Scrubber</p>
                  <p className="text-sm text-muted-foreground">Claims checked before submission — errors caught before payer rejection</p>
                </div>
              </div>
              <div className="flex gap-6 text-center">
                <div><p className="text-2xl font-heading font-bold text-emerald-600">247</p><p className="text-xs text-muted-foreground">Clean Claims</p></div>
                <div><p className="text-2xl font-heading font-bold text-red-500">5</p><p className="text-xs text-muted-foreground">Errors Found</p></div>
                <div><p className="text-2xl font-heading font-bold text-amber-600">3</p><p className="text-xs text-muted-foreground">Warnings</p></div>
              </div>
              <Button className="gap-2"><Zap className="w-4 h-4" /> Auto-Fix All</Button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <h3 className="font-heading font-semibold">Issues Detected</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Fix these before submitting to prevent payer denials</p>
              </div>
              <div className="divide-y divide-border">
                {scrubIssues.map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="p-4 flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.severity === "error" ? "bg-red-50" : "bg-amber-50"}`}>
                      <AlertTriangle className={`w-4 h-4 ${item.severity === "error" ? "text-red-500" : "text-amber-500"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs font-bold">{item.cpt}</span>
                        <span className="text-sm font-medium">{item.patient}</span>
                        <Badge className={item.severity === "error" ? "bg-red-100 text-red-700 text-[10px]" : "bg-amber-100 text-amber-700 text-[10px]"}>
                          {item.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.issue}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-emerald-600 font-medium mb-1">Suggested Fix</p>
                      <p className="text-xs font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">{item.fix}</p>
                    </div>
                    <Button size="sm" variant="outline" className="shrink-0 text-xs gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Apply Fix
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </TabsContent>

        {/* ── Real-Time Eligibility ── */}
        <TabsContent value="eligibility" className="mt-4">
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-sky-50 to-accent/5 border border-accent/20 rounded-2xl p-5 flex flex-wrap items-center gap-4 justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Search className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-heading font-semibold">Real-Time Eligibility Verification</p>
                  <p className="text-sm text-muted-foreground">Confirm patient coverage & out-of-pocket estimates before the appointment</p>
                </div>
              </div>
              <Button className="gap-2"><RefreshCw className="w-4 h-4" /> Verify All Today</Button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <h3 className="font-heading font-semibold">Upcoming Appointments — Coverage Status</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Auto-verified via clearinghouse 24 hours before each visit</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 text-xs text-muted-foreground">
                      <th className="text-left p-4 font-medium">Patient</th>
                      <th className="text-left p-4 font-medium">Appointment</th>
                      <th className="text-left p-4 font-medium">Payer / Plan</th>
                      <th className="text-left p-4 font-medium">Deductible</th>
                      <th className="text-left p-4 font-medium">Met</th>
                      <th className="text-left p-4 font-medium">Copay</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligibilityChecks.map((row, i) => (
                      <tr key={i} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium text-sm flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />{row.patient}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">{row.appt}</td>
                        <td className="p-4 text-sm">
                          <p className="font-medium">{row.payer}</p>
                          <p className="text-xs text-muted-foreground">{row.plan}</p>
                        </td>
                        <td className="p-4 text-sm">{row.deductible}</td>
                        <td className="p-4 text-sm font-medium text-primary">{row.met}</td>
                        <td className="p-4 text-sm">{row.copay}</td>
                        <td className="p-4">
                          <Badge className={
                            row.status === "verified" ? "bg-emerald-100 text-emerald-700" :
                            row.status === "inactive" ? "bg-red-100 text-red-700" :
                            "bg-amber-100 text-amber-700"
                          }>
                            {row.status === "verified" ? "Verified" : row.status === "inactive" ? "Inactive Coverage" : "Prior Auth Needed"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {row.status !== "verified" && (
                            <Button size="sm" variant="ghost" className="text-primary text-xs gap-1 h-7">
                              Resolve <ArrowRight className="w-3 h-3" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </TabsContent>

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
          <div className="space-y-4">
            {/* Alert banner */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-700">2 new denials flagged today</p>
                <p className="text-xs text-red-600">Emily Davis (CLM-2024-003) and Robert Lee (CLM-2024-006) — appeal window closes in 28 days</p>
              </div>
              <Button size="sm" className="gap-2 bg-red-600 hover:bg-red-700 text-white shrink-0">
                <BrainCircuit className="w-4 h-4" /> AI Appeal All Eligible
              </Button>
            </motion.div>

            {/* Automation status */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}
              className="bg-gradient-to-r from-primary/5 to-violet-50 border border-primary/15 rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Denial Automation — Active</p>
                <p className="text-xs text-muted-foreground mt-0.5">AI monitors every denial, drafts appeals, and submits within 24 hrs of flag</p>
              </div>
              <div className="flex gap-6 text-center">
                <div><p className="text-lg font-heading font-bold text-emerald-600">$38,300</p><p className="text-[10px] text-muted-foreground">Recoverable</p></div>
                <div><p className="text-lg font-heading font-bold text-primary">78%</p><p className="text-[10px] text-muted-foreground">Appeal Success Rate</p></div>
                <div><p className="text-lg font-heading font-bold">31</p><p className="text-[10px] text-muted-foreground">Open Denials</p></div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-6">
              <h3 className="font-heading font-semibold mb-4">Denial Breakdown by Reason</h3>
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
                      <p className="text-[10px] text-muted-foreground">{item.recoverable > 0 ? "recoverable" : "non-recoverable"}</p>
                    </div>
                    {item.recoverable > 0 ? (
                      <Button size="sm" className="gap-1 text-xs shrink-0">
                        <Zap className="w-3 h-3" /> AI Appeal
                      </Button>
                    ) : (
                      <Badge className="bg-muted text-muted-foreground text-xs shrink-0">Timely Filing</Badge>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
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