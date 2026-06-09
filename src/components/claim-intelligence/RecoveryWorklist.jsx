import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Clock, AlertTriangle, Loader2, ArrowRight } from "lucide-react";

const PIPELINE = ["identified", "in_progress", "resubmitted", "recovered", "written_off"];

const pipelineConfig = {
  identified: { label: "Identified", Icon: Circle, color: "bg-slate-100 text-slate-600" },
  in_progress: { label: "In Progress", Icon: Loader2, color: "bg-blue-100 text-blue-700" },
  resubmitted: { label: "Resubmitted", Icon: Clock, color: "bg-purple-100 text-purple-700" },
  recovered: { label: "Recovered", Icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
  written_off: { label: "Written Off", Icon: AlertTriangle, color: "bg-red-100 text-red-700" },
};

const urgencyColors = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

const initialItems = [
  { id: 1, claim: "CLM-2024-8701", patient: "Tom Baker", payer: "Cigna", amount: 4100, urgency: "high", status: "identified", reason: "Never resubmitted after CO-15 denial — auth issue unresolved", daysLeft: 10 },
  { id: 2, claim: "CLM-2024-8512", patient: "Nancy White", payer: "Humana", amount: 2300, urgency: "high", status: "identified", reason: "Approaching 60-day filing deadline — immediate action required", daysLeft: 7 },
  { id: 3, claim: "CLM-2024-8599", patient: "Lisa Monroe", payer: "Medicare", amount: 3200, urgency: "high", status: "in_progress", reason: "Medical necessity letter drafted, pending attending physician signature", daysLeft: 22 },
  { id: 4, claim: "CLM-2024-8821", patient: "Robert Chen", payer: "Blue Cross", amount: 1850, urgency: "medium", status: "in_progress", reason: "Missing documentation added, ready to resubmit", daysLeft: 35 },
  { id: 5, claim: "CLM-2024-8720", patient: "Emily Park", payer: "United Health", amount: 980, urgency: "medium", status: "resubmitted", reason: "Resubmitted with modifier -59 on 11/01, awaiting adjudication", daysLeft: 28 },
  { id: 6, claim: "CLM-2024-8654", patient: "George Kim", payer: "Aetna", amount: 750, urgency: "low", status: "resubmitted", reason: "Corrected CPT/ICD pairing resubmitted, expected 30-day response", daysLeft: 45 },
];

export default function RecoveryWorklist() {
  const { clinicId } = useClinic();
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState("all");

  // Load real worklist from DB
  useEffect(() => {
    if (!clinicId) return;
    const load = async () => {
      try {
        const res = await base44.functions.invoke("awsClaims", { action: "recovery_worklist", clinic_id: clinicId });
        const list = res?.data;
        if (Array.isArray(list) && list.length > 0) setItems(list);
      } catch { /* fallback to sample */ }
    };
    load();
  }, [clinicId]);

  const advance = async (id) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const idx = PIPELINE.indexOf(item.status);
    const next = PIPELINE[Math.min(idx + 1, PIPELINE.length - 1)];
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: next } : i));
    try {
      await base44.functions.invoke("awsClaims", {
        action: "update_recovery_status",
        clinic_id: clinicId,
        claim_id: item.claim,
        status: next,
      });
      toast.success(`${item.claim} moved to "${pipelineConfig[next].label}"`);
    } catch (e) {
      toast.error("Failed to update status: " + (e.message || "Try again."));
    }
  };

  const displayed = filter === "all" ? items : items.filter(i => i.status === filter);
  const totalRecoverable = items.filter(i => !["recovered", "written_off"].includes(i.status)).reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-semibold">Revenue Recovery Worklist</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Prioritized by dollar value & filing urgency</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
          <span className="text-xs text-muted-foreground">Recoverable: </span>
          <span className="text-sm font-bold text-emerald-700">${(Number(totalRecoverable) || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Pipeline filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")} className="h-7 text-xs">
          All ({items.length})
        </Button>
        {PIPELINE.map(s => {
          const count = items.filter(i => i.status === s).length;
          return (
            <Button key={s} size="sm" variant={filter === s ? "default" : "outline"} onClick={() => setFilter(s)} className="h-7 text-xs">
              {pipelineConfig[s].label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Worklist items */}
      <div className="space-y-2">
        {displayed.map((item, i) => {
          const pipe = pipelineConfig[item.status];
          const isDone = ["recovered", "written_off"].includes(item.status);
          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-xs font-medium text-primary">{item.claim}</span>
                    <span className="text-sm font-medium">{item.patient}</span>
                    <span className="text-xs text-muted-foreground">· {item.payer}</span>
                    <Badge className={`${urgencyColors[item.urgency]} border text-xs ml-auto`}>
                      {item.urgency} urgency
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.reason}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className={`${pipe.color} text-xs`}>
                      {pipe.label}
                    </Badge>
                    {item.daysLeft && (
                      <span className={`text-xs ${item.daysLeft <= 14 ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
                        {item.daysLeft}d to deadline
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-lg font-heading font-bold text-foreground">${(Number(item.amount) || 0).toLocaleString()}</span>
                  {!isDone && (
                    <Button size="sm" onClick={() => advance(item.id)} className="h-7 text-xs gap-1">
                      Advance <ArrowRight className="w-3 h-3" />
                    </Button>
                  )}
                  {item.status === "recovered" && (
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Recovered
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        {displayed.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">No items in this stage.</div>
        )}
      </div>
    </div>
  );
}