import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, User, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const statusConfig = {
  checked_in: { label: "Checked In", color: "bg-emerald-100 text-emerald-700" },
  confirmed: { label: "Confirmed", color: "bg-primary/10 text-primary" },
  in_progress: { label: "In Progress", color: "bg-amber-100 text-amber-700" },
  scheduled: { label: "Scheduled", color: "bg-muted text-muted-foreground" },
  no_show: { label: "No Show", color: "bg-red-100 text-red-700" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "Cancelled", color: "bg-muted text-muted-foreground" },
};

export default function TodaySchedule() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await base44.functions.invoke("awsAppointments", { action: "list" });
        const raw = res.data;
        const all = Array.isArray(raw) ? raw
          : Array.isArray(raw?.appointments) ? raw.appointments
          : Array.isArray(raw?.data) ? raw.data : [];

        const today = new Date().toISOString().split("T")[0];
        const todayAppts = all.filter(a => {
          const d = a.appointment_date || a.date || "";
          return d.startsWith(today);
        });

        // Sort by time
        todayAppts.sort((a, b) => {
          const aDate = new Date(a.appointment_date || a.date || 0);
          const bDate = new Date(b.appointment_date || b.date || 0);
          return aDate - bDate;
        });

        setAppointments(todayAppts);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

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
          <p className="text-xs text-muted-foreground mt-0.5">
            {loading ? "Loading..." : `${appointments.length} appointments`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>Live</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading schedule...</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
            No appointments scheduled for today.
          </div>
        ) : (
          appointments.map((apt, i) => {
            const statusKey = apt.status || "scheduled";
            const status = statusConfig[statusKey] || statusConfig.scheduled;
            const name = apt.patient_name || apt.patientName || "Unknown Patient";
            const provider = apt.provider_name || apt.providerName || apt.provider || "—";
            const type = apt.type || apt.appointment_type || "Visit";

            return (
              <motion.div
                key={apt.id || i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm cursor-pointer",
                  statusKey === "no_show" ? "border-red-200/50 bg-red-50/30" : "border-border hover:border-primary/20"
                )}
              >
                <div className="text-xs font-mono font-medium text-muted-foreground w-16 shrink-0">
                  {formatTime(apt.appointment_date || apt.date)}
                </div>
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{name}</p>
                  <p className="text-[11px] text-muted-foreground">{provider} · {type}</p>
                </div>
                <Badge className={cn("text-[10px] font-medium shrink-0", status.color)}>
                  {status.label}
                </Badge>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}