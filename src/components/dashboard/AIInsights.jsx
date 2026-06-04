import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrainCircuit, AlertTriangle, DollarSign, Users, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const insights = [
  {
    type: "revenue",
    priority: "high",
    icon: DollarSign,
    title: "Revenue Recovery Opportunity",
    description: "23 denied claims totaling $47,800 are eligible for appeal. AI has drafted appeal letters for 18 of them.",
    action: "Review Appeals",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    type: "patients",
    priority: "medium",
    icon: Users,
    title: "Patient Reactivation Alert",
    description: "142 patients haven't visited in 6+ months. Recommended: Launch reactivation campaign targeting high-value patients first.",
    action: "Launch Campaign",
    color: "text-primary bg-primary/10",
  },
  {
    type: "schedule",
    priority: "high",
    icon: Calendar,
    title: "Schedule Gap Detected",
    description: "Dr. Martinez has 4 open slots tomorrow afternoon. 8 waitlisted patients match availability.",
    action: "Fill Gaps",
    color: "text-amber-600 bg-amber-50",
  },
  {
    type: "risk",
    priority: "critical",
    icon: AlertTriangle,
    title: "Churn Risk Identified",
    description: "12 high-value patients show declining visit frequency. AI predicts 8 are likely to churn within 30 days.",
    action: "View Patients",
    color: "text-red-500 bg-red-50",
  },
];

const priorityStyles = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-amber-100 text-amber-700 border-amber-200",
  medium: "bg-primary/10 text-primary border-primary/20",
};

export default function AIInsights() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="bg-card rounded-2xl border border-border p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <BrainCircuit className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-foreground">AI Insights</h3>
          <p className="text-[10px] text-muted-foreground">Real-time recommendations</p>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.08 }}
            className="group p-4 rounded-xl border border-border hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 transition-all duration-300"
          >
            <div className="flex items-start gap-3">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", insight.color)}>
                <insight.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-foreground">{insight.title}</h4>
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", priorityStyles[insight.priority])}>
                    {insight.priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
                <Button variant="ghost" size="sm" className="text-primary text-xs mt-2 -ml-2 h-7 gap-1 hover:gap-2 transition-all">
                  {insight.action} <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}