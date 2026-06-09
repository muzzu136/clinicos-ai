import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Zap, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function RecoveryRevenueWidget() {
  const { clinicId } = useClinic();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clinicId) { setLoading(false); return; }
    const load = async () => {
      try {
        const res = await base44.functions.invoke("awsClaims", { action: "list", clinic_id: clinicId });
        const claims = Array.isArray(res.data) ? res.data : res.data?.claims || [];
        const appealedClaims = claims.filter(c => c.status === "appealed" || c.status === "recovered");
        const byMonth = {};
        appealedClaims.forEach(c => {
          const d = new Date(c.service_date || c.updated_at || c.created_at);
          if (isNaN(d)) return;
          const key = MONTHS[d.getMonth()];
          byMonth[key] = (byMonth[key] || 0) + (Number(c.amount_paid) || 0);
        });
        const built = Object.entries(byMonth).map(([month, recovered]) => ({ month, recovered }));
        const t = built.reduce((s, d) => s + d.recovered, 0);
        setData(built.length > 0 ? built : []);
        setTotal(t);
      } catch { setData([]); setTotal(0); }
      setLoading(false);
    };
    load();
  }, [clinicId]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="bg-card rounded-2xl border border-border p-5">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="font-heading font-semibold text-sm">AI Revenue Recovery</h3>
        </div>
        <div className="text-right">
          <p className="text-lg font-heading font-bold text-emerald-600">${(total / 1000).toFixed(1)}K</p>
          <p className="text-[10px] text-muted-foreground">Recovered YTD</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mb-3">
        <TrendingUp className="w-3 h-3 text-emerald-600" />
        <p className="text-xs text-emerald-600 font-medium">Via AI-assisted claim appeals</p>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-20 gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      ) : data.length === 0 ? (
        <div className="h-20 flex items-center justify-center text-xs text-muted-foreground">No recovery data yet — appeal denied claims to track here.</div>
      ) : (
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(172,66%,50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(172,66%,50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" vertical={false} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "hsl(215,16%,47%)" }} />
            <Tooltip formatter={v => [`$${v.toLocaleString()}`, "Recovered"]} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Area type="monotone" dataKey="recovered" stroke="hsl(172,66%,50%)" strokeWidth={2} fill="url(#recGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      )}
      <Link to="/claim-intelligence" className="block mt-3 text-xs text-primary hover:underline text-center">
        View Claim Intelligence →
      </Link>
    </motion.div>
  );
}
