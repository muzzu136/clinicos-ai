import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus, UserPlus, TrendingUp, Target, DollarSign,
  Phone, Mail, Globe, ArrowRight
} from "lucide-react";

const leads = [
  { name: "Jennifer Smith", email: "jen@email.com", phone: "(555) 111-2222", source: "Google Ads", service: "Dental Cleaning", status: "new", score: 85, date: "Nov 22" },
  { name: "Carlos Rodriguez", email: "carlos@email.com", phone: "(555) 222-3333", source: "Website", service: "Annual Physical", status: "contacted", score: 72, date: "Nov 21" },
  { name: "Patricia Wang", email: "p.wang@email.com", phone: "(555) 333-4444", source: "Referral", service: "PT Consultation", status: "qualified", score: 91, date: "Nov 20" },
  { name: "Thomas Baker", email: "tom.b@email.com", phone: "(555) 444-5555", source: "Facebook", service: "Mental Health", status: "appointment_set", score: 95, date: "Nov 19" },
  { name: "Rachel Kim", email: "r.kim@email.com", phone: "(555) 555-6666", source: "Walk-in", service: "Urgent Care", status: "converted", score: 88, date: "Nov 18" },
  { name: "Daniel Foster", email: "d.foster@email.com", phone: "(555) 666-7777", source: "Google Ads", service: "Chiropractic", status: "new", score: 67, date: "Nov 22" },
];

const statusConfig = {
  new: { label: "New", color: "bg-primary/10 text-primary" },
  contacted: { label: "Contacted", color: "bg-amber-100 text-amber-700" },
  qualified: { label: "Qualified", color: "bg-violet-100 text-violet-700" },
  appointment_set: { label: "Apt. Set", color: "bg-emerald-100 text-emerald-700" },
  converted: { label: "Converted", color: "bg-emerald-600 text-white" },
  lost: { label: "Lost", color: "bg-muted text-muted-foreground" },
};

const sourceIcons = { "Google Ads": Globe, Website: Globe, Referral: UserPlus, Facebook: Globe, "Walk-in": UserPlus };

export default function Leads() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Lead Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Patient acquisition CRM & conversion tracking</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Add Lead</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "New Leads", value: "24", icon: UserPlus, color: "bg-primary/10 text-primary" },
          { label: "Conversion Rate", value: "38%", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
          { label: "Avg Lead Score", value: "74", icon: Target, color: "bg-violet-50 text-violet-600" },
          { label: "Revenue from Leads", value: "$12.4K", icon: DollarSign, color: "bg-amber-50 text-amber-600" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl border border-border p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-heading font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Pipeline */}
      <div className="grid grid-cols-5 gap-3">
        {["new", "contacted", "qualified", "appointment_set", "converted"].map(stage => {
          const stageLeads = leads.filter(l => l.status === stage);
          const config = statusConfig[stage];
          return (
            <div key={stage} className="bg-card rounded-xl border border-border p-3">
              <div className="flex items-center gap-2 mb-3">
                <Badge className={config.color}>{config.label}</Badge>
                <span className="text-xs text-muted-foreground">{stageLeads.length}</span>
              </div>
              <div className="space-y-2">
                {stageLeads.map((lead, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="p-3 rounded-lg border border-border hover:border-primary/20 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {lead.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-xs font-medium truncate">{lead.name}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-1">{lead.service}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{lead.source}</span>
                      <div className="flex items-center gap-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${lead.score > 80 ? "bg-emerald-500" : lead.score > 50 ? "bg-amber-500" : "bg-red-500"}`} />
                        <span className="text-[10px] font-medium">{lead.score}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}