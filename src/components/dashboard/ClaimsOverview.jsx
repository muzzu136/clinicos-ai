import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";

const claimsData = [
  { name: "Paid", value: 245, color: "hsl(172, 66%, 50%)" },
  { name: "Pending", value: 82, color: "hsl(217, 91%, 60%)" },
  { name: "Denied", value: 23, color: "hsl(0, 84%, 60%)" },
  { name: "Submitted", value: 45, color: "hsl(38, 92%, 50%)" },
];

const total = claimsData.reduce((s, d) => s + d.value, 0);

export default function ClaimsOverview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <h3 className="font-heading font-semibold text-foreground mb-1">Claims Status</h3>
      <p className="text-xs text-muted-foreground mb-4">This month's overview</p>

      <div className="flex items-center gap-6">
        <div className="relative w-40 h-40 shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={claimsData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {claimsData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} claims`, name]}
                contentStyle={{ borderRadius: 12, border: "1px solid hsl(214, 32%, 91%)", fontSize: 12 }}
              />
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
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {((item.value / total) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}