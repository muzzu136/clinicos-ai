import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, BrainCircuit, ArrowRight, Loader2, AlertCircle } from "lucide-react";
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

const defaultClaimForm = {
  patient_name: "", payer_name: "", cpt_codes: "", icd_codes: "",
  amount_billed: "", service_date: "", provider_name: "", status: "submitted",
};

export default function Claims() {
  const { clinicId, loading: clinicLoading } = useClinic();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newClaimOpen, setNewClaimOpen] = useState(false);
  const [claimForm, setClaimForm] = useState(defaultClaimForm);
  const [claimSaving, setClaimSaving] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiOpen, setAiOpen] = useState(false);

  const fetchClaims = useCallback(async () => {
    if (!clinicId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("awsClaims", { action: "list", clinic_id: clinicId });
      const raw = res.data;
      const list = Array.isArray(raw) ? raw
        : Array.isArray(raw?.claims) ? raw.claims
        : Array.isArray(raw?.data) ? raw.data
        : Array.isArray(raw?.items) ? raw.items : [];
      setClaims(list);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [clinicId]);

  useEffect(() => {
    if (!clinicLoading) fetchClaims();
  }, [clinicId, clinicLoading, fetchClaims]);

  const handleNewClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimForm.patient_name || !claimForm.payer_name || !claimForm.amount_billed || !claimForm.service_date) {
      setClaimError("Patient name, payer, amount, and service date are required.");
      return;
    }
    setClaimSaving(true);
    setClaimError("");
    try {
      await base44.functions.invoke("awsClaims", {
        action: "create",
        clinic_id: clinicId,
        claim: {
          ...claimForm,
          cpt_codes: claimForm.cpt_codes.split(",").map(s => s.trim()).filter(Boolean),
          icd_codes: claimForm.icd_codes.split(",").map(s => s.trim()).filter(Boolean),
          amount_billed: parseFloat(claimForm.amount_billed),
        },
      });
      // Optimistic update
      const optimistic = {
        ...claimForm,
        id: `temp_${Date.now()}`,
        claim_number: `DRAFT-${Date.now()}`,
        cpt_codes: claimForm.cpt_codes.split(",").map(s => s.trim()).filter(Boolean),
        amount_billed: parseFloat(claimForm.amount_billed),
        amount_paid: 0,
        days_outstanding: 0,
      };
      setClaims(prev => [optimistic, ...prev]);
      toast.success("Claim created successfully.");
      setNewClaimOpen(false);
      setClaimForm(defaultClaimForm);
      setTimeout(() => fetchClaims(), 800);
    } catch (err) {
      setClaimError(err.message || "Failed to create claim. Please try again.");
    } finally {
      setClaimSaving(false);
    }
  };

  const handleAIAnalyze = async () => {
    setAnalyzing(true);
    setAiOpen(true);
    setAiResult("");
    try {
      const summary = {
        total: claims.length,
        denied: claims.filter(c => c.status === "denied").length,
        pending: claims.filter(c => c.status === "pending").length,
        paid: claims.filter(c => c.status === "paid").length,
        totalBilled: claims.reduce((s, c) => s + (Number(c.amount_billed) || 0), 0),
        totalPaid: claims.reduce((s, c) => s + (Number(c.amount_paid) || 0), 0),
      };
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a medical billing AI analyst. Analyze this clinic's claims data and provide 5 actionable insights:
- Total claims: ${summary.total}
- Denied: ${summary.denied}
- Pending: ${summary.pending}
- Paid: ${summary.paid}
- Total billed: $${summary.totalBilled.toLocaleString()}
- Total collected: $${summary.totalPaid.toLocaleString()}
- Collection rate: ${summary.totalBilled > 0 ? Math.round((summary.totalPaid / summary.totalBilled) * 100) : 0}%

Provide specific, actionable insights about denial patterns, collection opportunities, and workflow improvements. Format as numbered list.`,
      });
      setAiResult(typeof response === "string" ? response : response?.text || "No analysis available.");
    } catch (e) {
      setAiResult("AI analysis unavailable: " + (e.message || "Try again."));
    } finally {
      setAnalyzing(false);
    }
  };

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
          <Button variant="outline" className="gap-2" onClick={handleAIAnalyze} disabled={analyzing}>
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}
            AI Analyze
          </Button>
          <Button className="gap-2" onClick={() => setNewClaimOpen(true)}>
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
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <p>No claims found.</p>
            <Button size="sm" onClick={() => setNewClaimOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Add your first claim</Button>
          </div>
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
                        <Button size="sm" variant="ghost" className="text-primary text-xs gap-1 h-7"
                          onClick={async () => {
                            try {
                              await base44.functions.invoke("awsClaims", { action: "appeal", clinic_id: clinicId, claim_id: claim.id || claim.claim_number });
                              toast.success(`Appeal submitted for ${claim.claim_number || claim.id}`);
                              fetchClaims();
                            } catch(e) { toast.error("Appeal failed: " + (e.message || "Try again.")); }
                          }}>
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

      {/* New Claim Dialog */}
      <Dialog open={newClaimOpen} onOpenChange={(v) => { if (!claimSaving) { setNewClaimOpen(v); setClaimError(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Claim</DialogTitle></DialogHeader>
          <form onSubmit={handleNewClaimSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Patient Name *</Label>
                <Input className="mt-1" value={claimForm.patient_name} onChange={e => setClaimForm(p => ({...p, patient_name: e.target.value}))} placeholder="Full name" /></div>
              <div><Label className="text-xs">Provider</Label>
                <Input className="mt-1" value={claimForm.provider_name} onChange={e => setClaimForm(p => ({...p, provider_name: e.target.value}))} placeholder="Dr. Name" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Payer Name *</Label>
                <Input className="mt-1" value={claimForm.payer_name} onChange={e => setClaimForm(p => ({...p, payer_name: e.target.value}))} placeholder="e.g. BlueCross" /></div>
              <div><Label className="text-xs">Service Date *</Label>
                <Input className="mt-1" type="date" value={claimForm.service_date} onChange={e => setClaimForm(p => ({...p, service_date: e.target.value}))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">CPT Codes (comma-separated)</Label>
                <Input className="mt-1" value={claimForm.cpt_codes} onChange={e => setClaimForm(p => ({...p, cpt_codes: e.target.value}))} placeholder="99213, 27447" /></div>
              <div><Label className="text-xs">ICD-10 Codes (comma-separated)</Label>
                <Input className="mt-1" value={claimForm.icd_codes} onChange={e => setClaimForm(p => ({...p, icd_codes: e.target.value}))} placeholder="J06.9, M17.11" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Amount Billed ($) *</Label>
                <Input className="mt-1" type="number" min="0" step="0.01" value={claimForm.amount_billed} onChange={e => setClaimForm(p => ({...p, amount_billed: e.target.value}))} placeholder="0.00" /></div>
              <div><Label className="text-xs">Status</Label>
                <Select value={claimForm.status} onValueChange={v => setClaimForm(p => ({...p, status: v}))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {claimError && <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded p-2"><AlertCircle className="w-4 h-4 shrink-0" />{claimError}</div>}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setNewClaimOpen(false)} className="flex-1" disabled={claimSaving}>Cancel</Button>
              <Button type="submit" className="flex-1 gap-2" disabled={claimSaving}>
                {claimSaving && <Loader2 className="w-4 h-4 animate-spin" />} Create Claim
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Analysis Dialog */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-primary" /> AI Claims Analysis</DialogTitle></DialogHeader>
          {analyzing ? (
            <div className="flex items-center gap-3 py-8 justify-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" /> Analyzing your claims data...
            </div>
          ) : (
            <div className="text-sm whitespace-pre-wrap text-foreground leading-relaxed max-h-96 overflow-y-auto">{aiResult}</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
