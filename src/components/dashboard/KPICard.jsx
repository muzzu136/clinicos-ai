import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

export default function KPICard({ title, value, change, changeLabel, icon: Icon, iconColor, index = 0 }) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
          isPositive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
        )}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{title}</p>
      {changeLabel && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{changeLabel}</p>}
    </motion.div>
  );
}