import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, AlertTriangle, Zap, Upload, FileText, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";
import { toast } from "sonner";

const mockIssues = [
  { id: 1, severity: "critical", type: "Missing Modifier", field: "CPT 99213", message: "Modifier required for E&M code with procedure on same day. Consider modifier -25.", confidence: 92, accepted: null },
  { id: 2, severity: "warning", type: "ICD-10 Mismatch", field: "J06.9 + 99214", message: "Upper respiratory diagnosis (J06.9) may not support level 4 E&M. Expected level 3 (99213).", confidence: 78, accepted: null },
  { id: 3, severity: "warning", type: "Prior Auth Required", field: "Procedure: 27447", message: "Blue Cross typically requires prior auth for code 27447. Verify auth on file.", confidence: 88, accepted: null },
  { id: 4, severity: "info", type: "Timely Filing Risk", field: "Service Date: 45 days ago", message: "Blue Cross has a 90-day filing limit. This claim is at 50% of deadline.", confidence: 100, accepted: null },
];

const mockClaim = {
  claim_number: "CLM-DRAFT-2024-0091",
  patient: "Sarah Martinez",
  payer: "Blue Cross Blue Shield",
  service_date: "2024-10-22",
  amount: 2840,
  cpt: ["99214", "27447", "J3301"],
  icd: ["J06.9", "M17.11"],
  npi: "1234567890",
};

const sevConfig = {
  critical: { Icon: AlertCircle, bg: "bg-red-50 border-red-200", icon: "text-red-500", badge: "bg-red-100 text-red-700 border-red-200" },
  warning: { Icon: AlertTriangle, bg: "bg-amber-50 border-amber-200", icon: "text-amber-500", badge: "bg-amber-100 text-amber-700 border-amber-200" },
  info: { Icon: CheckCircle2, bg: "bg-blue-50 border-blue-200", icon: "text-blue-500", badge: "bg-blue-100 text-blue-700 border-blue-200" },
};

export default function ClaimScrubberTool() {
  const { clinicId } = useClinic();
  const [issues, setIssues] = useState(mockIssues);
  const [currentClaim, setCurrentClaim] = useState(mockClaim);
  const [uploading, setUploading] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const fileInputRef = useRef(null);

  const handleAccept = (id) => setIssues(prev => prev.map(i => i.id === id ? { ...i, accepted: true } : i));
  const handleReject = (id) => setIssues(prev => prev.map(i => i.id === id ? { ...i, accepted: false } : i));

  const resolved = issues.filter(i => i.accepted !== null).length;
  const baseScore = 67;
  const score = Math.min(100, baseScore + resolved * 8);
  const criticalOpen = issues.filter(i => i.severity === "critical" && i.accepted === null).length;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["csv", "837", "txt", "edi"].includes(ext)) {
      toast.error("Please upload a CSV or 837 EDI file.");
      return;
    }
    setUploading(true);
    toast.info(`Uploading ${file.name}...`);
    try {
      // Read file as text and send to scrubber
      const text = await file.text();
      const res = await base44.functions.invoke("awsClaimScrubber", {
        action: "scrub_upload",
        clinic_id: clinicId,
        filename: file.name,
        content: text.slice(0, 50000), // limit payload size
      });
      const scrubResult = res?.data;
      if (scrubResult?.issues?.length > 0) {
        setIssues(scrubResult.issues.map((iss, i) => ({ id: i + 1, ...iss, accepted: null })));
        if (scrubResult.claim) setCurrentClaim(scrubResult.claim);
        toast.success(`Scrub complete: ${scrubResult.issues.length} issue(s) found.`);
      } else {
        toast.success("File uploaded and scrubbed — no issues found!");
        setIssues([]);
      }
    } catch (e) {
      toast.error("Upload failed: " + (e.message || "Check file format and try again."));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAutoScrub = async () => {
    setScrubbing(true);
    try {
      const res = await base44.functions.invoke("awsClaimScrubber", {
        action: "scrub_claim",
        clinic_id: clinicId,
        claim: currentClaim,
      });
      const result = res?.data;
      if (result?.issues) {
        setIssues(result.issues.map((iss, i) => ({ id: i + 1, ...iss, accepted: null })));
        toast.success("AI scrub complete.");
      } else {
        toast.success("No issues found — claim looks clean!");
      }
    } catch (e) {
      toast.error("Scrub failed: " + (e.message || "Try again."));
    } finally {
      setScrubbing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Claim Summary Panel */}
      <div className="space-y-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-sm">Claim Under Review</h3>
            <Badge variant="outline" className="font-mono text-xs">{currentClaim.claim_number}</Badge>
          </div>
          <div className="space-y-2.5">
            {[
              ["Patient", currentClaim.patient],
              ["Payer", currentClaim.payer],
              ["Service Date", currentClaim.service_date],
              ["Amount", `$${currentClaim.amount?.toLocaleString()}`],
              ["NPI", currentClaim.npi],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-muted-foreground text-xs">{k}</span>
                <span className="text-xs font-medium">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">CPT Codes</p>
            <div className="flex flex-wrap gap-1.5">
              {(Array.isArray(currentClaim.cpt) ? currentClaim.cpt : []).map(c => (
                <Badge key={c} variant="outline" className="font-mono text-xs">{c}</Badge>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs text-muted-foreground mb-2">ICD-10 Codes</p>
            <div className="flex flex-wrap gap-1.5">
              {(Array.isArray(currentClaim.icd) ? currentClaim.icd : []).map(c => (
                <Badge key={c} variant="outline" className="font-mono text-xs">{c}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Confidence */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold text-sm mb-3">Payment Confidence</h3>
          <div className={`text-3xl font-heading font-bold mb-1 ${score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-500" : "text-red-500"}`}>
            {score}%
          </div>
          <p className="text-xs text-muted-foreground mb-3">likely to pay</p>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${score}%` }} />
          </div>
          {criticalOpen > 0 && (
            <p className="text-xs text-red-500 mt-2">{criticalOpen} critical issue(s) still open</p>
          )}
        </div>

        {/* Upload */}
        <div className="space-y-2">
          <input ref={fileInputRef} type="file" accept=".csv,.837,.txt,.edi" className="hidden" onChange={handleFileUpload} />
          <Button
            className="w-full gap-2"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? "Uploading..." : "Upload New Claim (CSV / 837)"}
          </Button>
          <Button className="w-full gap-2" onClick={handleAutoScrub} disabled={scrubbing}>
            {scrubbing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {scrubbing ? "Scrubbing..." : "AI Scrub This Claim"}
          </Button>
        </div>
      </div>

      {/* Issues Panel */}
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-semibold">AI-Detected Issues</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{issues.length} issue(s) detected · {resolved} resolved</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setIssues(mockIssues)}>
            <FileText className="w-4 h-4" /> Reset
          </Button>
        </div>

        {issues.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-semibold text-emerald-700">Claim looks clean!</p>
            <p className="text-xs text-emerald-600 mt-1">No issues detected. Safe to submit.</p>
          </div>
        ) : (
          <AnimatePresence>
            {issues.map((issue) => {
              const cfg = sevConfig[issue.severity] || sevConfig.info;
              return (
                <motion.div key={issue.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border p-4 ${cfg.bg} ${issue.accepted === true ? "opacity-50" : ""}`}>
                  <div className="flex items-start gap-3">
                    <cfg.Icon className={`w-5 h-5 mt-0.5 shrink-0 ${cfg.icon}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge className={cfg.badge}>{issue.type}</Badge>
                        <span className="text-xs text-muted-foreground font-mono">{issue.field}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{issue.confidence}% confidence</span>
                      </div>
                      <p className="text-sm">{issue.message}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0 ml-2">
                      <button onClick={() => handleAccept(issue.id)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center border transition-colors ${issue.accepted === true ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/30 hover:border-emerald-500 hover:text-emerald-500"}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleReject(issue.id)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center border transition-colors ${issue.accepted === false ? "bg-red-500 border-red-500 text-white" : "border-muted-foreground/30 hover:border-red-400 hover:text-red-400"}`}>
                        <AlertCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
