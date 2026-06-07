import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, AlertTriangle, Zap, X, Check, Upload, FileText } from "lucide-react";

const mockIssues = [
  { id: 1, severity: "critical", type: "Missing Modifier", field: "CPT 99213", message: "Modifier required for E&M code with procedure on same day. Consider modifier -25.", confidence: 92, accepted: null },
  { id: 2, severity: "warning", type: "ICD-10 Mismatch", field: "J06.9 + 99214", message: "Upper respiratory diagnosis (J06.9) may not support level 4 E&M. Expected level 3 (99213).", confidence: 78, accepted: null },
  { id: 3, severity: "warning", type: "Prior Auth Required", field: "Procedure: 27447", message: "Blue Cross typically requires prior auth for code 27447 (knee arthroplasty). Verify auth on file.", confidence: 88, accepted: null },
  { id: 4, severity: "info", type: "Timely Filing Risk", field: "Service Date: 45 days ago", message: "Blue Cross has a 90-day filing limit. This claim is at 50% of deadline — submit within 45 days.", confidence: 100, accepted: null },
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
  const [issues, setIssues] = useState(mockIssues);

  const handleAccept = (id) => setIssues(prev => prev.map(i => i.id === id ? { ...i, accepted: true } : i));
  const handleReject = (id) => setIssues(prev => prev.map(i => i.id === id ? { ...i, accepted: false } : i));

  const resolved = issues.filter(i => i.accepted !== null).length;
  const baseScore = 67;
  const score = Math.min(100, baseScore + resolved * 8);
  const criticalOpen = issues.filter(i => i.severity === "critical" && i.accepted === null).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Claim Summary Panel */}
      <div className="space-y-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-sm">Claim Under Review</h3>
            <Badge variant="outline" className="font-mono text-xs">{mockClaim.claim_number}</Badge>
          </div>
          <div className="space-y-2.5">
            {[
              ["Patient", mockClaim.patient],
              ["Payer", mockClaim.payer],
              ["Service Date", mockClaim.service_date],
              ["Amount", `$${mockClaim.amount.toLocaleString()}`],
              ["NPI", mockClaim.npi],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-muted-foreground text-xs">{k}</span>
                <span className="text-xs font-medium">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1.5">CPT Codes</p>
            <div className="flex flex-wrap gap-1.5">
              {mockClaim.cpt.map(c => <Badge key={c} variant="outline" className="font-mono text-xs">{c}</Badge>)}
            </div>
            <p className="text-xs text-muted-foreground mt-3 mb-1.5">ICD-10 Codes</p>
            <div className="flex flex-wrap gap-1.5">
              {mockClaim.icd.map(c => <Badge key={c} variant="outline" className="font-mono text-xs">{c}</Badge>)}
            </div>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-heading font-semibold text-sm mb-3">Payment Confidence</h3>
          <div className="flex items-end gap-2 mb-2">
            <span className={`text-4xl font-heading font-bold ${score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-500" : "text-red-500"}`}>
              {score}%
            </span>
            <span className="text-sm text-muted-foreground mb-1">likely to pay</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${score}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {criticalOpen} critical issue(s) still open
          </p>
        </div>

        <Button variant="outline" className="w-full gap-2 text-sm">
          <Upload className="w-4 h-4" /> Upload New Claim (CSV / 837)
        </Button>
      </div>

      {/* AI Issues Panel */}
      <div className="lg:col-span-2 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-sm">AI-Detected Issues ({issues.length})</h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Critical</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Warning</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Info</span>
          </div>
        </div>

        <div className="space-y-3">
          {issues.map((issue) => {
            const cfg = sevConfig[issue.severity];
            return (
              <motion.div key={issue.id} layout
                className={`rounded-xl border p-4 transition-opacity ${cfg.bg} ${issue.accepted === false ? "opacity-40" : ""}`}>
                <div className="flex items-start gap-3">
                  <cfg.Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cfg.icon}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge className={`${cfg.badge} border text-xs`}>{issue.type}</Badge>
                      <span className="text-xs text-muted-foreground font-mono">{issue.field}</span>
                      <span className="text-xs text-muted-foreground ml-auto">AI: {issue.confidence}%</span>
                    </div>
                    <p className="text-sm text-foreground">{issue.message}</p>

                    {issue.accepted === null && (
                      <div className="flex items-center gap-2 mt-3">
                        <Button size="sm" onClick={() => handleAccept(issue.id)}
                          className="h-7 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                          <Check className="w-3 h-3" /> Accept Fix
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleReject(issue.id)}
                          className="h-7 px-3 text-xs gap-1.5">
                          <X className="w-3 h-3" /> Dismiss
                        </Button>
                      </div>
                    )}
                    {issue.accepted === true && (
                      <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Fix accepted — will apply on submit
                      </p>
                    )}
                    {issue.accepted === false && (
                      <p className="text-xs text-muted-foreground mt-2">Dismissed by staff</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex gap-3 pt-2">
          <Button className="flex-1 gap-2">
            <Zap className="w-4 h-4" /> Submit Clean Claim
          </Button>
          <Button variant="outline" className="gap-2">
            <FileText className="w-4 h-4" /> Save Draft
          </Button>
        </div>
      </div>
    </div>
  );
}