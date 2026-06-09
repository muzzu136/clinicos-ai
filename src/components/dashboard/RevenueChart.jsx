import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";
import { Loader2 } from "lucide-react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl">
      <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="text-xs text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: item.color }} />
          {item.dataKey === "revenue" ? "Revenue" : "Collections"}: ${(item.value / 1000).toFixed(0)}K
        </p>
      ))}
    </div>
  );
};

export default function RevenueChart() {
  const { clinicId } = useClinic();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clinicId) { setLoading(false); return; }
    const load = async () => {
      try {
        const res = await base44.functions.invoke("awsFinancials", { action: "revenue_by_month", clinic_id: clinicId });
        const raw = res?.data;
        if (Array.isArray(raw) && raw.length > 0) {
          setData(raw);
        } else {
          // Fallback: build from claims data
          const claimsRes = await base44.functions.invoke("awsClaims", { action: "list", clinic_id: clinicId });
          const claims = Array.isArray(claimsRes.data) ? claimsRes.data : claimsRes.data?.claims || [];
          const byMonth = {};
          claims.forEach(c => {
            const d = new Date(c.service_date || c.created_at);
            if (isNaN(d)) return;
            const key = MONTHS[d.getMonth()];
            if (!byMonth[key]) byMonth[key] = { month: key, revenue: 0, collections: 0 };
            byMonth[key].revenue += Number(c.amount_billed) || 0;
            byMonth[key].collections += Number(c.amount_paid) || 0;
          });
          const built = MONTHS.map(m => byMonth[m] || { month: m, revenue: 0, collections: 0 });
          setData(built);
        }
      } catch { setData([]); }
      setLoading(false);
    };
    load();
  }, [clinicId]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl border border-border p-6">
      <h3 className="font-heading font-semibold text-foreground mb-1">Revenue & Collections</h3>
      <p className="text-xs text-muted-foreground mb-5">12-month trend</p>
      {loading ? (
        <div className="flex items-center justify-center h-48 gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217,91%,60%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(217,91%,60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(172,66%,50%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(172,66%,50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} tickFormatter={v => `$${v/1000}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="hsl(217,91%,60%)" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
            <Area type="monotone" dataKey="collections" stroke="hsl(172,66%,50%)" strokeWidth={2} fill="url(#colGrad)" name="Collections" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
}
