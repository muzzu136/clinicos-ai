import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

const data = [
  { month: "Jan", revenue: 142000, collections: 128000 },
  { month: "Feb", revenue: 155000, collections: 139000 },
  { month: "Mar", revenue: 168000, collections: 152000 },
  { month: "Apr", revenue: 159000, collections: 145000 },
  { month: "May", revenue: 178000, collections: 162000 },
  { month: "Jun", revenue: 192000, collections: 175000 },
  { month: "Jul", revenue: 185000, collections: 168000 },
  { month: "Aug", revenue: 201000, collections: 184000 },
  { month: "Sep", revenue: 195000, collections: 179000 },
  { month: "Oct", revenue: 215000, collections: 198000 },
  { month: "Nov", revenue: 228000, collections: 211000 },
  { month: "Dec", revenue: 242000, collections: 225000 },
];

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading font-semibold text-foreground">Revenue & Collections</h3>
          <p className="text-xs text-muted-foreground mt-0.5">12-month trend</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="text-xs text-muted-foreground">Collections</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCollections" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215, 16%, 47%)" }} tickFormatter={(v) => `$${v / 1000}K`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="revenue" stroke="hsl(217, 91%, 60%)" strokeWidth={2.5} fill="url(#colorRevenue)" />
          <Area type="monotone" dataKey="collections" stroke="hsl(172, 66%, 50%)" strokeWidth={2.5} fill="url(#colorCollections)" />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}