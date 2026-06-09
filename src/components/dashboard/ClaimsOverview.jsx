import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";
import { Loader2 } from "lucide-react";

const COLORS = {
  paid: "hsl(172, 66%, 50%)",
  pending: "hsl(217, 91%, 60%)",
  denied: "hsl(0, 84%, 60%)",
  submitted: "hsl(38, 92%, 50%)",
  other: "hsl(215, 16%, 65%)",
};

export default function ClaimsOverview() {
  const { clinicId } = useClinic();
  const [claimsData, setClaimsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clinicId) { setLoading(false); return; }
    const load = async () => {
      try {
        const res = await base44.functions.invoke("awsClaims", { action: "list", clinic_id: clinicId });
        const raw = res.data;
        const list = Array.isArray(raw) ? raw : raw?.claims || raw?.data || [];
        const counts = { paid: 0, pending: 0, denied: 0, submitted: 0 };
        list.forEach(c => {
          if (counts[c.status] !== undefined) counts[c.status]++;
          else counts.submitted++;
        });
        const data = Object.entries(counts)
          .filter(([, v]) => v > 0)
          .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, color: COLORS[name] || COLORS.other }));
        setClaimsData(data);
      } catch { /* fallback to empty */ }
      setLoading(false);
    };
    load();
  }, [clinicId]);

  const total = claimsData.reduce((s, d) => s + d.value, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="bg-card rounded-2xl border border-border p-6">
      <h3 className="font-heading font-semibold text-foreground mb-1">Claims Status</h3>
      <p className="text-xs text-muted-foreground mb-4">This month's overview</p>

      {loading ? (
        <div className="flex items-center justify-center h-32 gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      ) : total === 0 ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">No claims data yet.</div>
      ) : (
        <div className="flex items-center gap-6">
          <div className="relative w-40 h-40 shrink-0">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={claimsData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value" stroke="none">
                  {claimsData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} claims`, name]} contentStyle={{ borderRadius: 12, border: "1px solid hsl(214, 32%, 91%)", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-heading font-bold">{total}</span>
              <span className="text-[10px] text-muted-foreground">Total</span>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            {claimsData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{item.value}</span>
                  <span className="text-xs text-muted-foreground w-10 text-right">{((item.value / total) * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
