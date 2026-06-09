import { useState, useEffect } from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";
import KPICard from "@/components/dashboard/KPICard";
import { Calendar, DollarSign, FileText, Loader2, TrendingUp, Users } from "lucide-react";

export default function CustomerDashboard() {
  const [clinic, setClinic] = useState(null);
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClinicData = async () => {
      try {
        const user = await base44.auth.me();
        if (!user || !user.clinic_id) {
          window.location.href = "/onboarding";
          return;
        }

        // Get clinic info
        const clinicRes = await base44.entities.Clinic.filter({ id: user.clinic_id });
        if (clinicRes.length > 0) {
          setClinic(clinicRes[0]);
        }

        // Load clinic data
        const [patientsRes, appointmentsRes, claimsRes] = await Promise.all([
          base44.functions.invoke("awsPatients", { action: "list", clinic_id: user.clinic_id }),
          base44.functions.invoke("awsAppointments", { action: "list", clinic_id: user.clinic_id }),
          base44.functions.invoke("awsClaims", { action: "list", clinic_id: user.clinic_id })
        ]);

        const patients = Array.isArray(patientsRes.data) ? patientsRes.data : patientsRes.data?.patients || [];
        const appointments = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : appointmentsRes.data?.appointments || [];
        const claims = Array.isArray(claimsRes.data) ? claimsRes.data : claimsRes.data?.claims || [];

        const activePatients = patients.filter(p => p.status === "active").length;
        const todayAppts = appointments.filter(a => new Date(a.appointment_date).toDateString() === new Date().toDateString()).length;
        const totalRevenue = patients.reduce((sum, p) => sum + (p.total_revenue || 0), 0);
        const collectionRate = claims.length > 0 ? Math.round((claims.filter(c => c.status === "paid").length / claims.length) * 100) : 0;

        setKpis([
          { title: "Monthly Revenue", value: `$${(totalRevenue / 1000).toFixed(0)}K`, change: 0, changeLabel: "this month", icon: DollarSign, iconColor: "bg-emerald-100 text-emerald-600" },
          { title: "Active Patients", value: activePatients.toString(), change: 0, changeLabel: "active", icon: Users, iconColor: "bg-primary/10 text-primary" },
          { title: "Appointments Today", value: todayAppts.toString(), change: 0, changeLabel: "scheduled", icon: Calendar, iconColor: "bg-amber-100 text-amber-600" },
          { title: "Collection Rate", value: `${collectionRate}%`, change: 0, changeLabel: "overall", icon: TrendingUp, iconColor: "bg-violet-100 text-violet-600" },
        ]);
      } catch (e) {
        console.error("Failed to load clinic data:", e);
      toast.error("Failed to load clinic data:");
      } finally {
        setLoading(false);
      }
    };

    loadClinicData();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen gap-2 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /> Loading...</div>;
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Welcome, {clinic?.name}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your clinic dashboard</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard key={i} {...kpi} index={i} />
        ))}
      </div>
    </div>
  );
}