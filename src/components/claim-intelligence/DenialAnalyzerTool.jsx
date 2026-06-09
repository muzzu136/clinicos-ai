import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, ChevronDown, ChevronUp, Lightbulb, AlertCircle } from "lucide-react";

const DENIAL_CODES = {
  "CO-16": { category: "Missing/Invalid Info", color: "bg-red-100 text-red-700 border-red-200", plain: "The claim is missing required information or has a billing error. Most common denial reason — check all required fields on the claim form." },
  "CO-97": { category: "Duplicate/Bundled", color: "bg-orange-100 text-orange-700 border-orange-200", plain: "This service is already included in the payment for another procedure that was adjudicated. Check for unbundling opportunities." },
  "CO-50": { category: "Medical Necessity", color: "bg-red-100 text-red-700 border-red-200", plain: "The payer determined this service is not medically necessary based on their coverage criteria. Clinical documentation required." },
  "CO-11": { category: "Code Mismatch", color: "bg-amber-100 text-amber-700 border-amber-200", plain: "The diagnosis code is inconsistent with the procedure. Review ICD-10 and CPT pairing against clinical documentation." },
  "CO-15": { category: "Auth Required", color: "bg-purple-100 text-purple-700 border-purple-200", plain: "Prior authorization was required but not obtained or submitted with the claim. Request retro-auth or provide emergency justification." },
  "PR-1": { category: "Patient Responsibility", color: "bg-blue-100 text-blue-700 border-blue-200", plain: "Deductible amount — patient owes this portion per their insurance plan. Bill the patient directly." },
};

const mockDenials = [
  { id: 1, claim: "CLM-2024-8821", patient: "Robert Chen", payer: "Blue Cross", code: "CO-16", amount: 1850, date: "2024-10-15", action: "Resubmit with attending physician notes and completed Box 19 on UB-04.", filingDeadline: "2024-12-14" },
  { id: 2, claim: "CLM-2024-8799", patient: "Maria Santos", payer: "Medicare", code: "CO-50", amount: 3200, date: "2024-10-10", action: "Draft a medical necessity letter citing relevant clinical guidelines. Attach lab results and provider notes.", filingDeadline: "2025-01-10" },
  { id: 3, claim: "CLM-2024-8754", patient: "James Wilson", payer: "Aetna", code: "CO-11", amount: 620, date: "2024-10-05", action: "Verify ICD-10 matches clinical documentation. Update diagnosis to M54.5 if clinically appropriate.", filingDeadline: "2025-01-05" },
  { id: 4, claim: "CLM-2024-8720", patient: "Emily Park", payer: "United Health", code: "CO-97", amount: 980, date: "2024-09-28", action: "Unbundle CPT codes or apply modifier -59 to justify separate billing on same date of service.", filingDeadline: "2024-12-28" },
  { id: 5, claim: "CLM-2024-8701", patient: "Tom Baker", payer: "Cigna", code: "CO-15", amount: 4100, date: "2024-09-20", action: "Submit retroactive prior authorization request or provide documentation proving emergency clinical need.", filingDeadline: "2024-12-20" },
];

export default function DenialAnalyzerTool() {
  const { clinicId } = useClinic();
  const [expanded, setExpanded] = useState(null);
  const [denials, setDenials] = useState(mockDenials);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    toast.info(`Importing ${file.name}...`);
    try {
      const text = await file.text();
      const res = await base44.functions.invoke("awsClaims", {
        action: "import_era",
        clinic_id: clinicId,
        filename: file.name,
        content: text.slice(0, 50000),
      });
      const imported = res?.data?.denials || res?.data;
      if (Array.isArray(imported) && imported.length > 0) {
        setDenials(imported);
        toast.success(`Imported ${imported.length} denial record(s).`);
      } else {
        toast.success("File imported successfully.");
      }
    } catch (e) {
      toast.error("Import failed: " + (e.message || "Check file format."));
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const totalAtRisk = denials.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-semibold">Denial Analyzer</h3>
          <p className="text-xs text-muted-foreground mt-0.5">AI-categorized denials with plain-English explanations and next actions</p>
        </div>
        <input ref={fileInputRef} type="file" accept=".csv,.era,.txt,.835" className="hidden" onChange={handleImport} />
        <Button variant="outline" className="gap-2 text-sm" onClick={() => fileInputRef.current?.click()} disabled={importing}>
          {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {importing ? "Importing..." : "Import ERA / CSV"}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Denials", value: mockDenials.length, color: "text-foreground" },
          { label: "Total At Risk", value: `$${totalAtRisk.toLocaleString()}`, color: "text-red-600" },
          { label: "Approaching Deadline", value: "2 claims", color: "text-amber-600" },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-3 text-center">
            <p className={`text-xl font-heading font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {denials.map((denial) => {
          const info = DENIAL_CODES[denial.code] || { category: "Other", color: "bg-muted text-muted-foreground border-border", plain: "Review claim details." };
          const isOpen = expanded === denial.id;
          return (
            <div key={denial.id} className="bg-card rounded-xl border border-border overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : denial.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors text-left">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-medium text-primary">{denial.claim}</span>
                    <span className="text-sm font-medium">{denial.patient}</span>
                    <span className="text-xs text-muted-foreground">· {denial.payer}</span>
                  </div>
                </div>
                <Badge className={`${info.color} border text-xs shrink-0`}>{denial.code}</Badge>
                <span className="font-semibold text-sm text-red-600 shrink-0">${denial.amount.toLocaleString()}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }} className="overflow-hidden border-t border-border">
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-muted/40 rounded-lg p-4">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">What This Means</p>
                          <p className="text-sm text-foreground">{info.plain}</p>
                          <Badge className={`${info.color} border text-xs mt-2`}>{info.category}</Badge>
                        </div>
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Lightbulb className="w-3.5 h-3.5 text-primary" />
                            <p className="text-xs font-semibold text-primary uppercase tracking-wider">AI Recommended Action</p>
                          </div>
                          <p className="text-sm text-foreground">{denial.action}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Button size="sm" className="gap-1.5 text-xs h-8">Generate Appeal Letter</Button>
                        <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">Mark In Progress</Button>
                        <p className="text-xs text-muted-foreground ml-auto">
                          Filing deadline: <span className="font-semibold text-amber-600">{denial.filingDeadline}</span>
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}