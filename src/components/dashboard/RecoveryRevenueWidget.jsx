import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const data = [
  { month: "Jan", recovered: 8200 },
  { month: "Feb", recovered: 11500 },
  { month: "Mar", recovered: 14200 },
  { month: "Apr", recovered: 17800 },
  { month: "May", recovered: 20100 },
  { month: "Jun", recovered: 22400 },
];

const total = data.reduce((s, d) => s + d.recovered, 0);

export default function RecoveryRevenueWidget() {
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
      <div className="flex items-center gap-1 mb-3">
        <TrendingUp className="w-3 h-3 text-emerald-500" />
        <span className="text-xs text-emerald-600 font-medium">+173% growth in recovered revenue</span>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="recovGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(215, 16%, 47%)" }} />
          <YAxis hide />
          <Tooltip formatter={v => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: 10, border: "1px solid hsl(214, 32%, 91%)", fontSize: 11 }} />
          <Area type="monotone" dataKey="recovered" stroke="hsl(172, 66%, 50%)" strokeWidth={2} fill="url(#recovGrad)" name="Recovered" />
        </AreaChart>
      </ResponsiveContainer>
      <Link to="/subscription" className="text-xs text-primary hover:underline mt-2 inline-block">View full recovery report →</Link>
    </motion.div>
  );
}