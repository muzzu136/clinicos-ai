import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const providers = [
  { name: "Dr. Sarah Martinez", specialty: "Family Medicine", utilization: 92, revenue: 78500, patients: 145, rating: 4.9 },
  { name: "Dr. Raj Patel", specialty: "Internal Medicine", utilization: 87, revenue: 72300, patients: 132, rating: 4.8 },
  { name: "Dr. Lisa Kim", specialty: "Pediatrics", utilization: 78, revenue: 58900, patients: 168, rating: 4.7 },
  { name: "Dr. James Cooper", specialty: "Urgent Care", utilization: 85, revenue: 65400, patients: 198, rating: 4.6 },
];

export default function ProviderPerformance() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <h3 className="font-heading font-semibold text-foreground mb-1">Provider Performance</h3>
      <p className="text-xs text-muted-foreground mb-5">Month-to-date metrics</p>

      <div className="space-y-4">
        {providers.map((provider, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 + i * 0.06 }}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {provider.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-foreground truncate">{provider.name}</p>
                <span className="text-xs font-semibold text-foreground">{provider.utilization}%</span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2">{provider.specialty}</p>
              <Progress value={provider.utilization} className="h-1.5" />
            </div>
            <div className="text-right shrink-0 hidden sm:block">
              <p className="text-sm font-semibold text-foreground">${(provider.revenue / 1000).toFixed(1)}K</p>
              <p className="text-[10px] text-muted-foreground">{provider.patients} pts · ★ {provider.rating}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}