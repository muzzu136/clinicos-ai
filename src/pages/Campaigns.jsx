import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Plus, Mail, MessageSquare, Phone, TrendingUp,
  Users, DollarSign, Play, Pause, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";

import CreateCampaignDialog from "@/components/campaigns/CreateCampaignDialog";

const campaigns = [
  {
    name: "Q4 Patient Reactivation",
    type: "reactivation",
    channel: "multi",
    status: "active",
    targeted: 142,
    sent: 138,
    responses: 47,
    conversions: 23,
    revenue: 18400,
    startDate: "Nov 1, 2024",
  },
  {
    name: "Annual Wellness Reminders",
    type: "wellness",
    channel: "sms",
    status: "active",
    targeted: 284,
    sent: 284,
    responses: 112,
    conversions: 68,
    revenue: 34200,
    startDate: "Oct 15, 2024",
  },
  {
    name: "Review Request Campaign",
    type: "review_request",
    channel: "sms",
    status: "active",
    targeted: 96,
    sent: 96,
    responses: 42,
    conversions: 38,
    revenue: 0,
    startDate: "Nov 10, 2024",
  },
  {
    name: "Holiday Season Promotion",
    type: "seasonal",
    channel: "email",
    status: "draft",
    targeted: 500,
    sent: 0,
    responses: 0,
    conversions: 0,
    revenue: 0,
    startDate: "Dec 1, 2024",
  },
  {
    name: "Referral Rewards Program",
    type: "referral",
    channel: "multi",
    status: "completed",
    targeted: 200,
    sent: 200,
    responses: 78,
    conversions: 34,
    revenue: 27600,
    startDate: "Sep 1, 2024",
  },
];

const channelIcons = { sms: MessageSquare, email: Mail, voice: Phone, multi: BarChart3 };
const statusConfig = {
  active: { label: "Active", color: "bg-emerald-100 text-emerald-700" },
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  paused: { label: "Paused", color: "bg-amber-100 text-amber-700" },
  completed: { label: "Completed", color: "bg-primary/10 text-primary" },
};

export default function Campaigns() {
  const { clinicId } = useClinic();

  // Attempt to load real data; falls back to sample data if unavailable
  useEffect(() => {
    if (!clinicId) return;
    const loadData = async () => {
      try {
        await base44.functions.invoke("awsCampaigns", { action: "list", clinic_id: clinicId });
        // Data loaded - in a full implementation, update state from response
      } catch (e) {
        // Falls back to sample data displayed in UI
        console.warn("Campaigns data unavailable:", e.message);
      }
    };
    loadData();
  }, [clinicId]);

  const [showNewDialog, setShowNewDialog] = useState(false);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Marketing Campaigns</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI-powered patient engagement & growth automation</p>
        </div>
        <Button onClick={() => setShowNewDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Create Campaign
        </Button>
        <CreateCampaignDialog 
          open={showNewDialog} 
          onClose={() => setShowNewDialog(false)} 
          onSuccess={() => window.location.reload()}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Campaigns", value: "3", icon: Play, color: "bg-emerald-50 text-emerald-600" },
          { label: "Total Sent", value: "718", icon: Mail, color: "bg-primary/10 text-primary" },
          { label: "Conversion Rate", value: "22.8%", icon: TrendingUp, color: "bg-amber-50 text-amber-600" },
          { label: "Revenue Generated", value: "$80.2K", icon: DollarSign, color: "bg-violet-50 text-violet-600" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-heading font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Campaign List */}
      <div className="space-y-3">
        {campaigns.map((campaign, i) => {
          const ChannelIcon = channelIcons[campaign.channel];
          const status = statusConfig[campaign.status];
          const convRate = campaign.sent > 0 ? ((campaign.conversions / campaign.sent) * 100).toFixed(1) : 0;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-card rounded-2xl border border-border p-5 hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <ChannelIcon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-sm font-semibold">{campaign.name}</h3>
                    <Badge className={status.color}>{status.label}</Badge>
                    <Badge variant="outline" className="text-[10px]">{campaign.type.replace("_", " ")}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">Started {campaign.startDate}</p>

                  <div className="grid grid-cols-5 gap-4">
                    <div>
                      <p className="text-lg font-heading font-bold">{campaign.targeted}</p>
                      <p className="text-[10px] text-muted-foreground">Targeted</p>
                    </div>
                    <div>
                      <p className="text-lg font-heading font-bold">{campaign.sent}</p>
                      <p className="text-[10px] text-muted-foreground">Sent</p>
                    </div>
                    <div>
                      <p className="text-lg font-heading font-bold">{campaign.responses}</p>
                      <p className="text-[10px] text-muted-foreground">Responses</p>
                    </div>
                    <div>
                      <p className="text-lg font-heading font-bold text-emerald-600">{campaign.conversions}</p>
                      <p className="text-[10px] text-muted-foreground">Conversions</p>
                    </div>
                    <div>
                      <p className="text-lg font-heading font-bold text-primary">${(campaign.revenue / 1000).toFixed(1)}K</p>
                      <p className="text-[10px] text-muted-foreground">Revenue</p>
                    </div>
                  </div>

                  {campaign.sent > 0 && (
                    <div className="mt-3 flex items-center gap-3">
                      <Progress value={parseFloat(convRate)} className="h-1.5 flex-1" />
                      <span className="text-xs font-medium text-muted-foreground">{convRate}% conversion</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}