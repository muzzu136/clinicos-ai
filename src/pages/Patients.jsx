import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Search, Plus, Filter, AlertTriangle, UserCheck, UserX, Users } from "lucide-react";

const patients = [
  { id: 1, name: "Sarah Johnson", email: "sarah.j@email.com", phone: "(555) 123-4567", insurance: "BlueCross", status: "active", lastVisit: "2024-11-15", revenue: 4280, churnRisk: 12 },
  { id: 2, name: "Michael Chen", email: "m.chen@email.com", phone: "(555) 234-5678", insurance: "Aetna", status: "active", lastVisit: "2024-11-20", revenue: 3150, churnRisk: 8 },
  { id: 3, name: "Emily Davis", email: "emily.d@email.com", phone: "(555) 345-6789", insurance: "UnitedHealth", status: "churning", lastVisit: "2024-08-10", revenue: 2890, churnRisk: 78 },
  { id: 4, name: "James Wilson", email: "j.wilson@email.com", phone: "(555) 456-7890", insurance: "Cigna", status: "active", lastVisit: "2024-11-18", revenue: 5670, churnRisk: 15 },
  { id: 5, name: "Maria Garcia", email: "m.garcia@email.com", phone: "(555) 567-8901", insurance: "Humana", status: "inactive", lastVisit: "2024-05-22", revenue: 1920, churnRisk: 92 },
  { id: 6, name: "Robert Lee", email: "r.lee@email.com", phone: "(555) 678-9012", insurance: "BlueCross", status: "active", lastVisit: "2024-11-22", revenue: 3840, churnRisk: 5 },
  { id: 7, name: "Lisa Anderson", email: "l.anderson@email.com", phone: "(555) 789-0123", insurance: "Aetna", status: "churning", lastVisit: "2024-09-05", revenue: 6210, churnRisk: 65 },
  { id: 8, name: "David Brown", email: "d.brown@email.com", phone: "(555) 890-1234", insurance: "UnitedHealth", status: "active", lastVisit: "2024-11-19", revenue: 2430, churnRisk: 22 },
];

const statusConfig = {
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700", icon: UserCheck },
  inactive: { label: "Inactive", color: "bg-muted text-muted-foreground", icon: UserX },
  churning: { label: "At Risk", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  lost: { label: "Lost", color: "bg-muted text-muted-foreground", icon: UserX },
};

export default function Patients() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = patients.filter(p => {
    if (tab !== "all" && p.status !== tab) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Patients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your patient database & retention</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Patient
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Patients", value: "2,847", icon: Users, color: "text-primary" },
          { label: "Active", value: "2,341", icon: UserCheck, color: "text-emerald-600" },
          { label: "At Risk", value: "142", icon: AlertTriangle, color: "text-red-500" },
          { label: "Inactive (6mo+)", value: "364", icon: UserX, color: "text-muted-foreground" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4 flex items-center gap-3"
          >
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <div>
              <p className="text-lg font-heading font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="churning">At Risk</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card rounded-2xl border border-border overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Patient</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Insurance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Churn Risk</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((patient) => {
              const status = statusConfig[patient.status];
              return (
                <TableRow key={patient.id} className="cursor-pointer hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {patient.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{patient.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-xs text-muted-foreground">{patient.email}</p>
                      <p className="text-xs text-muted-foreground">{patient.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{patient.insurance}</TableCell>
                  <TableCell>
                    <Badge className={status.color}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{patient.lastVisit}</TableCell>
                  <TableCell className="font-medium">${patient.revenue.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${patient.churnRisk > 60 ? "bg-red-500" : patient.churnRisk > 30 ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${patient.churnRisk}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{patient.churnRisk}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}