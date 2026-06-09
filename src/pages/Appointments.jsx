import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Plus, TrendingUp, XCircle, Video, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { base44 } from "@/api/base44Client";
import NewAppointmentDialog from "@/components/appointments/NewAppointmentDialog";
import { useClinic } from "@/components/ClinicContext";

const statusColors = {
  scheduled: "bg-primary/10 text-primary",
  confirmed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  checked_in: "bg-sky-100 text-sky-700",
  in_progress: "bg-violet-100 text-violet-700",
  completed: "bg-emerald-100 text-emerald-700",
  no_show: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
  rescheduled: "bg-amber-100 text-amber-700",
};

export default function Appointments() {
  const { clinicId } = useClinic();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewDialog, setShowNewDialog] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("awsAppointments", { action: "list", clinic_id: clinicId });
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.appointments) ? raw.appointments : (Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw?.items) ? raw.items : [])));
      setAppointments(list);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, [clinicId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const today = appointments.filter(a => {
    if (!a.appointment_date) return false;
    return new Date(a.appointment_date).toDateString() === new Date().toDateString();
  });

  const confirmed = appointments.filter(a => a.status === "confirmed").length;
  const noShows = appointments.filter(a => a.status === "no_show").length;

  // Only show current week appointments in the chart
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const thisWeekAppts = appointments.filter(a => {
    if (!a.appointment_date) return false;
    const d = new Date(a.appointment_date);
    return d >= startOfWeek && d < endOfWeek;
  });

  const weekData = days.map(day => {
    const dayApts = thisWeekAppts.filter(a => days[new Date(a.appointment_date).getDay()] === day);
    return {
      day,
      completed: dayApts.filter(a => a.status === "completed").length,
      noShow: dayApts.filter(a => a.status === "no_show").length,
    };
  });

  const providerMap = {};
  appointments.forEach(a => {
    if (!a.provider_name) return;
    providerMap[a.provider_name] = (providerMap[a.provider_name] || 0) + 1;
  });
  const maxCount = Math.max(...Object.values(providerMap), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Smart Appointments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI-optimized scheduling & capacity management</p>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="gap-2"><Plus className="w-4 h-4" /> New Appointment</Button>
        <NewAppointmentDialog 
          open={showNewDialog} 
          onClose={() => setShowNewDialog(false)} 
          onSuccess={() => fetchAppointments()}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Appointments", value: today.length, icon: Calendar, color: "bg-primary/10 text-primary" },
          { label: "Confirmed", value: confirmed, icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
          { label: "No-Shows", value: noShows, icon: XCircle, color: "bg-red-50 text-red-500" },
          { label: "Total", value: appointments.length, icon: Clock, color: "bg-amber-50 text-amber-600" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-heading font-bold">{loading ? "—" : stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading font-semibold mb-4">This Week's Appointments</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(214, 32%, 91%)", fontSize: 12 }} />
              <Bar dataKey="completed" fill="hsl(172, 66%, 50%)" radius={[4, 4, 0, 0]} name="Completed" />
              <Bar dataKey="noShow" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} name="No Show" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading font-semibold mb-4">Provider Load</h3>
          {loading ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          ) : Object.keys(providerMap).length === 0 ? (
            <p className="text-sm text-muted-foreground">No appointment data yet.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(providerMap).slice(0, 5).map(([name, count], i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{name}</span>
                    <span className="text-muted-foreground">{count} apts</span>
                  </div>
                  <Progress value={(count / maxCount) * 100} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-heading font-semibold mb-4">Today's Schedule</h3>
        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading schedule...
          </div>
        ) : today.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No appointments scheduled for today.</p>
        ) : (
          <div className="space-y-2">
            {today.map((apt, i) => {
              const time = new Date(apt.appointment_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              return (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-border hover:border-primary/20 transition-colors">
                  <span className="text-sm font-mono text-muted-foreground w-20 shrink-0">{time}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{apt.patient_name}</p>
                    <p className="text-xs text-muted-foreground">{apt.provider_name} · {apt.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {apt.type === "telehealth" && <Video className="w-4 h-4 text-primary" />}
                    <Badge className={statusColors[apt.status] || "bg-muted text-muted-foreground"}>{apt.status}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}