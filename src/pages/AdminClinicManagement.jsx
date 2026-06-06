import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Edit2 } from "lucide-react";

const statusColors = {
  trial: "bg-blue-100 text-blue-700",
  active: "bg-emerald-100 text-emerald-700",
  past_due: "bg-red-100 text-red-700",
  cancelled: "bg-muted text-muted-foreground"
};

export default function AdminClinicManagement() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadClinics = async () => {
      try {
        const res = await base44.entities.Clinic.list();
        setClinics(res || []);
      } catch (e) {
        console.error("Failed to load clinics:", e);
      } finally {
        setLoading(false);
      }
    };
    loadClinics();
  }, []);

  const filtered = clinics.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Clinic Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">All clinics on the platform</p>
        </div>
      </div>

      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search clinics..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading clinics...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">No clinics found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Clinic Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Trial Ends</TableHead>
                <TableHead>Renews</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((clinic) => (
                <TableRow key={clinic.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{clinic.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{clinic.email}</TableCell>
                  <TableCell><Badge variant="outline">{clinic.plan?.toUpperCase()}</Badge></TableCell>
                  <TableCell><Badge className={statusColors[clinic.subscription_status]}>{clinic.subscription_status}</Badge></TableCell>
                  <TableCell className="text-sm">{clinic.trial_ends || "—"}</TableCell>
                  <TableCell className="text-sm">{clinic.renews_at || "—"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}