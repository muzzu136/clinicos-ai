import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";
import { Loader2 } from "lucide-react";

export default function ProviderPerformance() {
  const { clinicId } = useClinic();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clinicId) { setLoading(false); return; }
    const load = async () => {
      try {
        const res = await base44.entities.Provider.filter({ clinic_id: clinicId });
        setProviders(res.slice(0, 5));
      } catch { setProviders([]); }
      setLoading(false);
    };
    load();
  }, [clinicId]);

  const maxRevenue = Math.max(...providers.map(p => p.revenue || p.total_revenue || 0), 1);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
      className="bg-card rounded-2xl border border-border p-6">
      <h3 className="font-heading font-semibold text-foreground mb-1">Provider Performance</h3>
      <p className="text-xs text-muted-foreground mb-5">Month-to-date metrics</p>
      {loading ? (
        <div className="flex items-center justify-center h-32 gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading...
        </div>
      ) : providers.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">No provider data yet.</div>
      ) : (
        <div className="space-y-4">
          {providers.map((provider, i) => {
            const name = provider.name || `${provider.first_name || ""} ${provider.last_name || ""}`.trim();
            const revenue = provider.revenue || provider.total_revenue || 0;
            const utilization = provider.utilization || 0;
            const initials = name.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2);
            return (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 + i * 0.06 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <Avatar className="w-9 h-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{initials || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium truncate">{name}</p>
                    <span className="text-xs font-semibold text-emerald-600 shrink-0">${(revenue / 1000).toFixed(1)}K</span>
                  </div>
                  <Progress value={maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0} className="h-1.5" />
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">{provider.specialty || "Provider"}</span>
                    <span className="text-[10px] text-muted-foreground">{utilization}% utilized</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
