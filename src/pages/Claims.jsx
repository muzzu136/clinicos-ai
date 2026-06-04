import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Search, Plus, FileText, DollarSign, CheckCircle2, XCircle,
  Clock, AlertTriangle, BrainCircuit, ArrowRight
} from "lucide-react";

const claims = [
  { id: "CLM-2024-001", patient: "Sarah Johnson", payer: "BlueCross", service: "Nov 15, 2024", billed: 450, paid: 420, status: "paid", days: 18, cpt: "99213" },
  { id: "CLM-2024-002", patient: "Michael Chen", payer: "Aetna", service: "Nov 18, 2024", billed: 680, paid: 0, status: "pending", days: 8, cpt: "99214" },
  { id: "CLM-2024-003", patient: "Emily Davis", payer: "UnitedHealth", service: "Nov 10, 2024", billed: 1200, paid: 0, status: "denied", days: 25, cpt: "99215" },
  { id: "CLM-2024-004", patient: "James Wilson", payer: "Cigna", service: "Nov 12, 2024", billed: 320, paid: 280, status: "partially_paid", days: 22, cpt: "99212" },
  { id: "CLM-2024-005", patient: "Maria Garcia", payer: "Humana", service: "Nov 20, 2024", billed: 890, paid: 0, status: "submitted", days: 3, cpt: "99214" },
  { id: "CLM-2024-006", patient: "Robert Lee", payer: "BlueCross", service: "Nov 8, 2024", billed: 1500, paid: 0, status: "denied", days: 28, cpt: "99215" },
  { id: "CLM-2024-007", patient: "Lisa Anderson", payer: "Aetna", service: "Nov 14, 2024", billed: 560, paid: 560, status: "paid", days: 14, cpt: "99213" },
  { id: "CLM-2024-008", patient: "David Brown", payer: "UnitedHealth", service: "Nov 19, 2024", billed: 740, paid: 0, status: "pending", days: 6, cpt: "99214" },
];

const statusConfig = {
  submitted: { label: "Submitted", color: "bg-primary/10 text-primary", icon: FileText },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700", icon: Clock },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  partially_paid: { label: "Partial", color: "bg-sky-100 text-sky-700", icon: DollarSign },
  denied: { label: "Denied", color: "bg-red-100 text-red-700", icon: XCircle },
  appealed: { label: "Appealed", color: "bg-violet-100 text-violet-700", icon: AlertTriangle },
};

export default function Claims() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = claims.filter(c => {
    if (tab !== "all" && c.status !== tab) return false;
    if (search && !c.patient.toLowerCase().includes(search.toLowerCase()) && !c.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Claims Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track, manage & optimize your claims pipeline</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <BrainCircuit className="w-4 h-4" /> AI Analyze
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> New Claim
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Total Claims", value: claims.length, color: "text-foreground" },
          { label: "Submitted", value: claims.filter(c => c.status === "submitted").length, color: "text-primary" },
          { label: "Pending", value: claims.filter(c => c.status === "pending").length, color: "text-amber-600" },
          { label: "Paid", value: claims.filter(c => c.status === "paid").length, color: "text-emerald-600" },
          { label: "Partial", value: claims.filter(c => c.status === "partially_paid").length, color: "text-sky-600" },
          { label: "Denied", value: claims.filter(c => c.status === "denied").length, color: "text-red-500" },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="bg-card rounded-xl border border-border p-3 text-center">
            <p className={`text-xl font-heading font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search claims..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="denied">Denied</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Claim ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Payer</TableHead>
              <TableHead>CPT</TableHead>
              <TableHead>Billed</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Days</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((claim) => {
              const status = statusConfig[claim.status];
              return (
                <TableRow key={claim.id} className="cursor-pointer hover:bg-muted/30">
                  <TableCell className="font-mono text-xs">{claim.id}</TableCell>
                  <TableCell className="font-medium text-sm">{claim.patient}</TableCell>
                  <TableCell className="text-sm">{claim.payer}</TableCell>
                  <TableCell className="font-mono text-xs">{claim.cpt}</TableCell>
                  <TableCell className="font-medium">${claim.billed.toLocaleString()}</TableCell>
                  <TableCell className={claim.paid > 0 ? "text-emerald-600 font-medium" : "text-muted-foreground"}>
                    ${claim.paid.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge className={status.color}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{claim.days}d</TableCell>
                  <TableCell>
                    {claim.status === "denied" && (
                      <Button size="sm" variant="ghost" className="text-primary text-xs gap-1 h-7">
                        Appeal <ArrowRight className="w-3 h-3" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}