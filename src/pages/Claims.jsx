import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, FileText, DollarSign, CheckCircle2, XCircle, Clock, AlertTriangle, BrainCircuit, ArrowRight, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";
import { toast } from "sonner";

const statusConfig = {
  submitted: { label: "Submitted", color: "bg-primary/10 text-primary" },
  pending: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  accepted: { label: "Accepted", color: "bg-sky-100 text-sky-700" },
  paid: { label: "Paid", color: "bg-emerald-100 text-emerald-700" },
  partially_paid: { label: "Partial", color: "bg-sky-100 text-sky-700" },
  denied: { label: "Denied", color: "bg-red-100 text-red-700" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
  appealed: { label: "Appealed", color: "bg-violet-100 text-violet-700" },
};

export default function Claims() {
  const { clinicId } = useClinic();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClaims = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await base44.functions.invoke("awsClaims", { action: "list", clinic_id: clinicId });
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.claims) ? raw.claims : (Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw?.items) ? raw.items : [])));
        setClaims(list);
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    };
    fetchClaims();
  }, []);

  const filtered = claims.filter(c => {
    const patient = c.patient_name || c.patient || "";
    const id = c.claim_number || c.id || "";
    if (tab !== "all" && c.status !== tab) return false;
    if (search && !patient.toLowerCase().includes(search.toLowerCase()) && !id.toLowerCase().includes(search.toLowerCase())) return false;
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
          <Button variant="outline" className="gap-2"><BrainCircuit className="w-4 h-4" /> AI Analyze</Button>
          <Button className="gap-2"><Plus className="w-4 h-4" /> New Claim</Button>
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
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className="bg-card rounded-xl border border-border p-3 text-center">
            <p className={`text-xl font-heading font-bold ${s.color}`}>{loading ? "—" : s.value}</p>
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
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading claims...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">No claims found.</div>
        ) : (
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
              {filtered.map((claim, idx) => {
                const status = statusConfig[claim.status] || { label: claim.status, color: "bg-muted text-muted-foreground" };
                const billed = claim.amount_billed ?? claim.billed ?? 0;
                const paid = claim.amount_paid ?? claim.paid ?? 0;
                const days = claim.days_outstanding ?? claim.days ?? 0;
                const cpt = Array.isArray(claim.cpt_codes) ? claim.cpt_codes[0] : (claim.cpt || "");
                return (
                  <TableRow key={claim.id || claim.claim_number || idx} className="cursor-pointer hover:bg-muted/30">
                    <TableCell className="font-mono text-xs">{claim.claim_number || claim.id}</TableCell>
                    <TableCell className="font-medium text-sm">{claim.patient_name || claim.patient}</TableCell>
                    <TableCell className="text-sm">{claim.payer_name || claim.payer}</TableCell>
                    <TableCell className="font-mono text-xs">{cpt}</TableCell>
                    <TableCell className="font-medium">${Number(billed).toLocaleString()}</TableCell>
                    <TableCell className={paid > 0 ? "text-emerald-600 font-medium" : "text-muted-foreground"}>
                      ${Number(paid).toLocaleString()}
                    </TableCell>
                    <TableCell><Badge className={status.color}>{status.label}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{days}d</TableCell>
                    <TableCell>
                      {claim.status === "denied" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-primary text-xs gap-1 h-7"
                          onClick={async () => {
                            try {
                              await base44.functions.invoke("awsClaims", { action: "appeal", clinic_id: clinicId, claim_id: claim.id || claim.claim_number });
                              toast.success(`Appeal submitted for claim ${claim.claim_number || claim.id}`);
                            } catch(e) {
                              toast.error("Appeal failed: " + (e.message || "Try again."));
                            }
                          }}
                        >
                          Appeal <ArrowRight className="w-3 h-3" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </motion.div>
    </div>
  );
}