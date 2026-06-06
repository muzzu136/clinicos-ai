import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Loader2 } from "lucide-react";

const statusConfig = {
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700" },
  inactive: { label: "Inactive", color: "bg-muted text-muted-foreground" },
};

export default function CustomerPatients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        if (!currentUser?.clinic_id) {
          window.location.href = "/onboarding";
          return;
        }

        const res = await base44.functions.invoke("awsPatients", { action: "list", clinic_id: currentUser.clinic_id });
        const list = Array.isArray(res.data) ? res.data : res.data?.patients || [];
        setPatients(list);
      } catch (e) {
        console.error("Failed to load patients:", e);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  const filtered = patients.filter(p => {
    const name = p.name || `${p.first_name || ""} ${p.last_name || ""}`.trim();
    return !search || name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Patients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your clinic patients</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Add Patient</Button>
      </div>

      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading patients...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">No patients found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Patient</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((patient, idx) => {
                const name = patient.name || `${patient.first_name || ""} ${patient.last_name || ""}`.trim();
                const status = statusConfig[patient.status] || statusConfig.active;
                return (
                  <TableRow key={patient.id || idx}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground">{patient.email}</p>
                      <p className="text-xs text-muted-foreground">{patient.phone}</p>
                    </TableCell>
                    <TableCell><Badge className={status.color}>{status.label}</Badge></TableCell>
                    <TableCell className="font-medium">${Number(patient.total_revenue || 0).toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}