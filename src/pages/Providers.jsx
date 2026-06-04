import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, DollarSign, Users, Calendar, TrendingUp, Clock } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const providers = [
  { name: "Dr. Sarah Martinez", specialty: "Family Medicine", utilization: 92, revenue: 78500, patients: 145, rating: 4.9, noShowRate: 3.2, aptsToday: 18 },
  { name: "Dr. Raj Patel", specialty: "Internal Medicine", utilization: 87, revenue: 72300, patients: 132, rating: 4.8, noShowRate: 4.1, aptsToday: 16 },
  { name: "Dr. Lisa Kim", specialty: "Pediatrics", utilization: 78, revenue: 58900, patients: 168, rating: 4.7, noShowRate: 5.8, aptsToday: 14 },
  { name: "Dr. James Cooper", specialty: "Urgent Care", utilization: 85, revenue: 65400, patients: 198, rating: 4.6, noShowRate: 2.9, aptsToday: 17 },
];

const revenueData = providers.map(p => ({
  name: p.name.replace("Dr. ", ""),
  revenue: p.revenue,
  patients: p.patients,
}));

export default function Providers() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Provider Intelligence</h1>
        <p className="text-sm text-muted-foreground mt-0.5">AI-powered provider performance analytics</p>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((provider, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:shadow-primary/5 transition-all"
          >
            <div className="flex items-start gap-4 mb-5">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {provider.name.split(" ").slice(1).map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-heading font-semibold">{provider.name}</h3>
                <p className="text-xs text-muted-foreground">{provider.specialty}</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold">{provider.rating}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <DollarSign className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <p className="text-sm font-bold">${(provider.revenue / 1000).toFixed(1)}K</p>
                <p className="text-[10px] text-muted-foreground">Revenue MTD</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <Users className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-sm font-bold">{provider.patients}</p>
                <p className="text-[10px] text-muted-foreground">Patients</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-muted/50">
                <Calendar className="w-4 h-4 text-violet-600 mx-auto mb-1" />
                <p className="text-sm font-bold">{provider.aptsToday}</p>
                <p className="text-[10px] text-muted-foreground">Today</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Utilization</span>
                  <span className="font-medium">{provider.utilization}%</span>
                </div>
                <Progress value={provider.utilization} className="h-2" />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">No-Show Rate</span>
                <Badge className={provider.noShowRate > 5 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}>
                  {provider.noShowRate}%
                </Badge>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Comparison */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-heading font-semibold mb-4">Revenue by Provider (MTD)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={revenueData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" horizontal={false} />
            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} tickFormatter={(v) => `$${v / 1000}K`} />
            <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} width={100} />
            <Tooltip formatter={(v) => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: 12, border: "1px solid hsl(214, 32%, 91%)", fontSize: 12 }} />
            <Bar dataKey="revenue" fill="hsl(217, 91%, 60%)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}