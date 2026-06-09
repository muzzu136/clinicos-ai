import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Search, Plus, AlertTriangle, UserCheck, UserX, Users, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";
import AddPatientDialog from "@/components/patients/AddPatientDialog";
import EditPatientDialog from "@/components/patients/EditPatientDialog";

const statusConfig = {
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700" },
  inactive: { label: "Inactive", color: "bg-muted text-muted-foreground" },
  churning: { label: "At Risk", color: "bg-red-100 text-red-700" },
  lost: { label: "Lost", color: "bg-muted text-muted-foreground" },
};

export default function Patients() {
  const { clinicId, loading: clinicLoading } = useClinic();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    if (!clinicId) {
      setLoading(false);
      return;
    }
    try {
      const res = await base44.functions.invoke("awsPatients", { action: "list", clinic_id: clinicId });
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.patients) ? raw.patients : (Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw?.items) ? raw.items : [])));
      setPatients(list);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    // When ClinicContext finishes loading (even without clinicId), stop the spinner
    if (!clinicLoading) {
      if (clinicId) {
        fetchPatients();
      } else {
        setLoading(false);
      }
    }
  }, [clinicId, clinicLoading]);

  const filtered = patients.filter(p => {
    const name = p.name || `${p.first_name || ""} ${p.last_name || ""}`.trim();
    if (tab !== "all" && p.status !== tab) return false;
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const active = patients.filter(p => p.status === "active").length;
  const atRisk = patients.filter(p => p.status === "churning").length;
  const inactive = patients.filter(p => p.status === "inactive").length;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Patients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your patient database & retention</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Add Patient</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Patients", value: patients.length, icon: Users, color: "text-primary" },
          { label: "Active", value: active, icon: UserCheck, color: "text-emerald-600" },
          { label: "At Risk", value: atRisk, icon: AlertTriangle, color: "text-red-500" },
          { label: "Inactive (6mo+)", value: inactive, icon: UserX, color: "text-muted-foreground" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
            <div>
              <p className="text-lg font-heading font-bold">{loading ? "—" : stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
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

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading patients...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20 text-red-500">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">No patients found.</div>
        ) : (
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
              {filtered.map((patient, idx) => {
                const name = patient.name || `${patient.first_name || ""} ${patient.last_name || ""}`.trim();
                const status = statusConfig[patient.status] || statusConfig.active;
                const churnRisk = patient.churn_risk_score ?? patient.churnRisk ?? 0;
                const revenue = patient.total_revenue ?? patient.revenue ?? 0;
                return (
                  <TableRow 
                    key={patient.id || idx} 
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => {
                      setEditingPatient(patient);
                      setEditDialogOpen(true);
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0,2) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground">{patient.email}</p>
                      <p className="text-xs text-muted-foreground">{patient.phone}</p>
                    </TableCell>
                    <TableCell className="text-sm">{patient.insurance_provider || patient.insurance}</TableCell>
                    <TableCell><Badge className={status.color}>{status.label}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{patient.last_visit_date || patient.lastVisit}</TableCell>
                    <TableCell className="font-medium">${Number(revenue).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${churnRisk > 60 ? "bg-red-500" : churnRisk > 30 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${churnRisk}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{churnRisk}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </motion.div>

      <AddPatientDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        clinicId={clinicId}
        onPatientAdded={() => {
          setLoading(true);
          fetchPatients();
        }}
      />

      <EditPatientDialog 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        patient={editingPatient}
        clinicId={clinicId}
        onPatientUpdated={() => {
          setLoading(true);
          fetchPatients();
        }}
      />
    </div>
  );
}