import { motion } from "framer-motion";
import { BrainCircuit, DollarSign, AlertTriangle, Calendar, TrendingUp, Zap } from "lucide-react";

const summaryItems = [
  { label: "Revenue Today", value: "$18,450", icon: DollarSign, color: "text-emerald-600" },
  { label: "Claims At Risk", value: "$47,800", icon: AlertTriangle, color: "text-amber-600" },
  { label: "Recoverable Revenue", value: "$32,100", icon: TrendingUp, color: "text-primary" },
  { label: "Appointments Lost", value: "6", icon: Calendar, color: "text-red-500" },
];

const actions = [
  "Appeal 18 denied claims — estimated recovery: $32,100",
  "Fill 4 open slots for Dr. Martinez tomorrow",
  "Launch reactivation campaign for 142 inactive patients",
  "Review 3 underpayments from BlueCross totaling $4,200",
  "Schedule wellness visits for 28 overdue patients",
];

export default function AIDailySummary() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg">AI Daily Summary</h3>
            <p className="text-xs text-white/50">Today's key metrics & actions</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {summaryItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10"
            >
              <item.icon className={`w-4 h-4 ${item.color} mb-2`} />
              <p className="text-lg font-heading font-bold">{item.value}</p>
              <p className="text-[10px] text-white/50">{item.label}</p>
            </motion.div>
          ))}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-semibold text-white/90">Recommended Actions</h4>
          </div>
          <div className="space-y-2">
            {actions.map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.06 }}
                className="flex items-start gap-2"
              >
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs text-white/70 leading-relaxed">{action}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}