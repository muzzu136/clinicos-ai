import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, FileText, AlertTriangle, TrendingUp, Search, Loader2 } from "lucide-react";

const claimStatusConfig = {
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700" },
  submitted: { label: "Submitted", color: "bg-sky-100 text-sky-700" },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  accepted: { label: "Accepted", color: "bg-primary/10 text-primary" },
  denied: { label: "Denied", color: "bg-red-100 text-red-700" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
  partially_paid: { label: "Partial", color: "bg-amber-100 text-amber-700" },
  appealed: { label: "Appealed", color: "bg-violet-100 text-violet-700" },
};

export default function BillingReport() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");

  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      try {
        const res = await base44.functions.invoke("awsClaims", { action: "list" });
        const raw = res.data;
        const list = Array.isArray(raw) ? raw
          : Array.isArray(raw?.claims) ? raw.claims
          : Array.isArray(raw?.data) ? raw.data
          : Array.isArray(raw?.items) ? raw.items : [];
        setClaims(list);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchClaims();
  }, []);

  // Aggregate stats (safe - no PHI in totals)
  const totalBilled = claims.reduce((s, c) => s + (Number(c.amount_billed) || 0), 0);
  const totalPaid = claims.reduce((s, c) => s + (Number(c.amount_paid) || 0), 0);
  const totalDenied = claims.filter(c => c.status === "denied" || c.status === "rejected")
    .reduce((s, c) => s + (Number(c.amount_billed) || 0), 0);
  const totalPending = claims.filter(c => c.status === "pending" || c.status === "submitted" || c.status === "accepted")
    .reduce((s, c) => s + (Number(c.amount_billed) || 0), 0);
  const collectionRate = totalBilled > 0 ? ((totalPaid / totalBilled) * 100).toFixed(1) : "0.0";

  // Payer breakdown for chart (aggregate, no PHI)
  const payerMap = {};
  claims.forEach(c => {
    const payer = c.payer_name || c.payer || "Unknown";
    if (!payerMap[payer]) payerMap[payer] = { payer, billed: 0, paid: 0 };
    payerMap[payer].billed += Number(c.amount_billed) || 0;
    payerMap[payer].paid += Number(c.amount_paid) || 0;
  });
  const payerData = Object.values(payerMap)
    .sort((a, b) => b.billed - a.billed)
    .slice(0, 8)
    .map(p => ({ ...p, billed: Math.round(p.billed / 1000), paid: Math.round(p.paid / 1000) }));

  // Per-patient charges (from AWS — PHI)
  const filtered = claims.filter(c => {
    if (tab !== "all" && c.status !== tab) return false;
    const name = c.patient_name || c.patientName || "";
    const payer = c.payer_name || c.payer || "";
    const num = c.claim_number || c.claimNumber || "";
    if (search && !name.toLowerCase().includes(search.toLowerCase()) &&
        !payer.toLowerCase().includes(search.toLowerCase()) &&
        !num.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = [
    { label: "Total Billed", value: `$${Math.round(totalBilled).toLocaleString()}`, icon: DollarSign, color: "text-primary" },
    { label: "Total Collected", value: `$${Math.round(totalPaid).toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600" },
    { label: "Pending / In-Flight", value: `$${Math.round(totalPending).toLocaleString()}`, icon: FileText, color: "text-amber-600" },
    { label: "Denied / Rejected", value: `$${Math.round(totalDenied).toLocaleString()}`, icon: AlertTriangle, color: "text-red-500" },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Billing Report</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Aggregate summaries on Base44 · Per-patient charges secured via AWS
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <s.icon className={`w-5 h-5 ${s.color}`} />
            <div>
              <p className="text-lg font-heading font-bold">{loading ? "—" : s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Collection Rate Banner */}
      {!loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Overall Collection Rate</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              ${Math.round(totalPaid).toLocaleString()} collected out of ${Math.round(totalBilled).toLocaleString()} billed
            </p>
          </div>
          <div className="text-3xl font-heading font-bold text-primary">{collectionRate}%</div>
        </motion.div>
      )}

      {/* Payer Breakdown Chart */}
      {!loading && payerData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-6">
          <div className="mb-4">
            <h3 className="font-heading font-semibold">Payer Breakdown</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Billed vs collected by insurance payer (in $K)</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={payerData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="payer" tick={{ fontSize: 10, fill: "hsl(215,16%,47%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215,16%,47%)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}K`} />
              <Tooltip formatter={(v, name) => [`$${v}K`, name === "billed" ? "Billed" : "Collected"]} />
              <Bar dataKey="billed" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="paid" fill="hsl(172,66%,50%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded bg-primary" /> Billed
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-3 h-3 rounded bg-accent" /> Collected
            </div>
          </div>
        </motion.div>
      )}

      {/* Per-Patient Charges — routed through AWS */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div>
            <h3 className="font-heading font-semibold text-foreground">Individual Patient Charges</h3>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              PHI-secured · routed through AWS
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search patient, payer, claim#..." value={search}
                onChange={e => setSearch(e.target.value)} className="pl-9 w-64" />
            </div>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="denied">Denied</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading patient charges...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
            No charges found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Claim #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Payer</TableHead>
                <TableHead>Service Date</TableHead>
                <TableHead>Billed</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Patient Resp.</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((claim, idx) => {
                const statusKey = claim.status || "submitted";
                const status = claimStatusConfig[statusKey] || { label: statusKey, color: "bg-muted text-muted-foreground" };
                return (
                  <TableRow key={claim.id || idx} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">{claim.claim_number || claim.claimNumber || "—"}</TableCell>
                    <TableCell className="font-medium">{claim.patient_name || claim.patientName || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{claim.provider_name || claim.providerName || "—"}</TableCell>
                    <TableCell className="text-sm">{claim.payer_name || claim.payer || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{claim.service_date || claim.serviceDate || "—"}</TableCell>
                    <TableCell className="font-medium">${Number(claim.amount_billed || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-emerald-600 font-medium">${Number(claim.amount_paid || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">${Number(claim.patient_responsibility || 0).toLocaleString()}</TableCell>
                    <TableCell><Badge className={status.color}>{status.label}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}