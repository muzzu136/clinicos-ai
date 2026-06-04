import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, AlertCircle, User } from "lucide-react";

const appointments = [
  { time: "9:00 AM", patient: "Sarah Johnson", provider: "Dr. Martinez", type: "Follow-up", status: "checked_in" },
  { time: "9:30 AM", patient: "Michael Chen", provider: "Dr. Martinez", type: "New Patient", status: "confirmed" },
  { time: "10:00 AM", patient: "Emily Davis", provider: "Dr. Patel", type: "Wellness", status: "in_progress" },
  { time: "10:30 AM", patient: "James Wilson", provider: "Dr. Patel", type: "Follow-up", status: "scheduled" },
  { time: "11:00 AM", patient: "Maria Garcia", provider: "Dr. Martinez", type: "Urgent", status: "confirmed" },
  { time: "11:30 AM", patient: "Robert Lee", provider: "Dr. Kim", type: "Telehealth", status: "no_show" },
  { time: "1:00 PM", patient: "Lisa Anderson", provider: "Dr. Kim", type: "Procedure", status: "scheduled" },
  { time: "1:30 PM", patient: "David Brown", provider: "Dr. Martinez", type: "Follow-up", status: "scheduled" },
];

const statusConfig = {
  checked_in: { label: "Checked In", color: "bg-emerald-100 text-emerald-700" },
  confirmed: { label: "Confirmed", color: "bg-primary/10 text-primary" },
  in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-700" },
  scheduled: { label: "Scheduled", color: "bg-muted text-muted-foreground" },
  no_show: { label: "No Show", color: "bg-red-100 text-red-700" },
};

export default function TodaySchedule() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-heading font-semibold text-foreground">Today's Schedule</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{appointments.length} appointments</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>Live</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {appointments.map((apt, i) => {
          const status = statusConfig[apt.status];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.04 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm cursor-pointer",
                apt.status === "no_show" ? "border-red-200/50 bg-red-50/30" : "border-border hover:border-primary/20"
              )}
            >
              <div className="text-xs font-mono font-medium text-muted-foreground w-16 shrink-0">
                {apt.time}
              </div>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{apt.patient}</p>
                <p className="text-[11px] text-muted-foreground">{apt.provider} · {apt.type}</p>
              </div>
              <Badge className={cn("text-[10px] font-medium shrink-0", status.color)}>
                {status.label}
              </Badge>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}