import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Calendar, Clock, Plus, Users, TrendingUp, AlertTriangle,
  CheckCircle2, XCircle, Video, Stethoscope
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const weekData = [
  { day: "Mon", scheduled: 42, completed: 38, noShow: 3 },
  { day: "Tue", scheduled: 48, completed: 44, noShow: 2 },
  { day: "Wed", scheduled: 45, completed: 40, noShow: 4 },
  { day: "Thu", scheduled: 50, completed: 46, noShow: 1 },
  { day: "Fri", scheduled: 38, completed: 35, noShow: 2 },
];

const upcomingAppointments = [
  { time: "9:00 AM", patient: "Sarah Johnson", type: "Follow-up", provider: "Dr. Martinez", status: "confirmed", mode: "in-person" },
  { time: "9:30 AM", patient: "Michael Chen", type: "New Patient", provider: "Dr. Martinez", status: "confirmed", mode: "in-person" },
  { time: "10:00 AM", patient: "Emily Davis", type: "Wellness", provider: "Dr. Patel", status: "waitlisted", mode: "telehealth" },
  { time: "10:30 AM", patient: "James Wilson", type: "Follow-up", provider: "Dr. Patel", status: "confirmed", mode: "in-person" },
  { time: "11:00 AM", patient: "Maria Garcia", type: "Urgent", provider: "Dr. Kim", status: "pending", mode: "in-person" },
  { time: "1:00 PM", patient: "Robert Lee", type: "Procedure", provider: "Dr. Cooper", status: "confirmed", mode: "in-person" },
  { time: "2:00 PM", patient: "Lisa Anderson", type: "Telehealth", provider: "Dr. Kim", status: "confirmed", mode: "telehealth" },
];

const statusColors = {
  confirmed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  waitlisted: "bg-primary/10 text-primary",
  cancelled: "bg-red-100 text-red-700",
};

export default function Appointments() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Smart Appointments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI-optimized scheduling & capacity management</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> New Appointment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Today's Appointments", value: "48", icon: Calendar, color: "bg-primary/10 text-primary" },
          { label: "Schedule Utilization", value: "87%", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
          { label: "No-Show Rate", value: "4.2%", icon: XCircle, color: "bg-red-50 text-red-500" },
          { label: "Waitlisted", value: "12", icon: Clock, color: "bg-amber-50 text-amber-600" },
          { label: "Open Slots", value: "6", icon: AlertTriangle, color: "bg-violet-50 text-violet-600" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-heading font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-card rounded-2xl border border-border p-6"
        >
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

        {/* Provider Utilization */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <h3 className="font-heading font-semibold mb-4">Provider Load</h3>
          <div className="space-y-4">
            {[
              { name: "Dr. Martinez", util: 92, slots: "18/20" },
              { name: "Dr. Patel", util: 87, slots: "17/20" },
              { name: "Dr. Kim", util: 78, slots: "15/20" },
              { name: "Dr. Cooper", util: 85, slots: "17/20" },
            ].map((p, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground">{p.slots} slots</span>
                </div>
                <Progress value={p.util} className="h-2" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Today's Schedule */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border p-6"
      >
        <h3 className="font-heading font-semibold mb-4">Today's Schedule</h3>
        <div className="space-y-2">
          {upcomingAppointments.map((apt, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-border hover:border-primary/20 transition-colors">
              <span className="text-sm font-mono text-muted-foreground w-20 shrink-0">{apt.time}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{apt.patient}</p>
                <p className="text-xs text-muted-foreground">{apt.provider} · {apt.type}</p>
              </div>
              <div className="flex items-center gap-2">
                {apt.mode === "telehealth" && <Video className="w-4 h-4 text-primary" />}
                <Badge className={statusColors[apt.status]}>{apt.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}