import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Users, UserPlus, TrendingUp, Star, Send,
  Building2, Heart, Globe, Gift
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const physicianReferrals = [
  { name: "Dr. Alan Brooks", practice: "Oak Park Family Medicine", referrals: 28, conversions: 24, revenue: 19200, status: "active" },
  { name: "Dr. Susan Lee", practice: "Riverside Cardiology", referrals: 21, conversions: 18, revenue: 14400, status: "active" },
  { name: "Dr. Mark Evans", practice: "North Side Ortho", referrals: 15, conversions: 12, revenue: 9600, status: "active" },
  { name: "Dr. Carol Jones", practice: "Metro Pediatrics", referrals: 9, conversions: 7, revenue: 5600, status: "inactive" },
];

const patientReferrals = [
  { name: "Robert Lee", referred: 4, converted: 4, rewardStatus: "sent" },
  { name: "Sarah Johnson", referred: 3, converted: 2, rewardStatus: "pending" },
  { name: "James Wilson", referred: 2, converted: 2, rewardStatus: "sent" },
  { name: "Angela Murray", referred: 1, converted: 1, rewardStatus: "sent" },
];

const monthlyData = [
  { month: "Jul", physician: 18, patient: 8, marketing: 14 },
  { month: "Aug", physician: 22, patient: 11, marketing: 16 },
  { month: "Sep", physician: 19, patient: 9, marketing: 18 },
  { month: "Oct", physician: 26, patient: 14, marketing: 21 },
  { month: "Nov", physician: 28, patient: 16, marketing: 24 },
  { month: "Dec", physician: 31, patient: 19, marketing: 22 },
];

const sourceData = [
  { name: "Physician", value: 54, color: "hsl(217,91%,60%)" },
  { name: "Patient", value: 24, color: "hsl(172,66%,50%)" },
  { name: "Marketing", value: 22, color: "hsl(262,83%,58%)" },
];

export default function Referrals() {
  const { clinicId } = useClinic();
  const [tab, setTab] = useState("physician");
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [requestData, setRequestData] = useState({ physicianEmail: "", message: "" });
  const [campaignData, setCampaignData] = useState({ name: "", type: "reactivation", channel: "sms" });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Referral Growth System</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track, automate, and grow your referral network</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowRequestDialog(true)} variant="outline" className="gap-2"><Send className="w-4 h-4" />Send Referral Request</Button>
          <Button onClick={() => setShowCampaignDialog(true)} className="gap-2"><Gift className="w-4 h-4" />Referral Campaign</Button>
        </div>
        {showRequestDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl p-6 max-w-md w-full">
              <h2 className="text-lg font-semibold mb-4">Send Referral Request</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Physician Email</label>
                  <input type="email" placeholder="physician@practice.com" value={requestData.physicianEmail} onChange={e => setRequestData({...requestData, physicianEmail: e.target.value})} className="w-full mt-1 h-9 rounded-md border border-input px-3" />
                </div>
                <div>
                  <label className="text-sm font-medium">Message</label>
                  <textarea placeholder="Personalize your referral request..." value={requestData.message} onChange={e => setRequestData({...requestData, message: e.target.value})} className="w-full mt-1 p-2 rounded-md border border-input text-sm" rows="4" />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowRequestDialog(false)} className="flex-1">Cancel</Button>
                <Button onClick={async () => { try { await base44.functions.invoke("awsReferrals", { action: "send_request", clinic_id: clinicId, ...requestData }); toast.success("Referral request sent to " + requestData.physicianEmail); } catch(e) { toast.error("Failed to send referral: " + (e.message||"Try again.")); } setShowRequestDialog(false); setRequestData({ physicianEmail: "", message: "" }); }} className="flex-1">Send Request</Button>
              </div>
            </div>
          </div>
        )}
        {showCampaignDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl p-6 max-w-md w-full">
              <h2 className="text-lg font-semibold mb-4">Create Referral Campaign</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Campaign Name</label>
                  <input type="text" placeholder="e.g., Physician Appreciation Q1" value={campaignData.name} onChange={e => setCampaignData({...campaignData, name: e.target.value})} className="w-full mt-1 h-9 rounded-md border border-input px-3" />
                </div>
                <div>
                  <label className="text-sm font-medium">Campaign Type</label>
                  <select value={campaignData.type} onChange={e => setCampaignData({...campaignData, type: e.target.value})} className="w-full mt-1 h-9 rounded-md border border-input px-3">
                    <option value="reactivation">Reactivation</option>
                    <option value="retention">Retention</option>
                    <option value="referral">Referral Reward</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Channel</label>
                  <select value={campaignData.channel} onChange={e => setCampaignData({...campaignData, channel: e.target.value})} className="w-full mt-1 h-9 rounded-md border border-input px-3">
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                    <option value="multi">Multi-channel</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setShowCampaignDialog(false)} className="flex-1">Cancel</Button>
                <Button onClick={async () => { try { await base44.functions.invoke("awsCampaigns", { action: "create", clinic_id: clinicId, ...campaignData }); toast.success(`Campaign "${campaignData.name}" created and scheduled!`); } catch(e) { toast.error("Failed to create campaign: " + (e.message||"Try again.")); } setShowCampaignDialog(false); setCampaignData({ name: "", type: "reactivation", channel: "sms" }); }} className="flex-1">Create Campaign</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Referrals (MTD)", value: "73", icon: Users, color: "bg-primary/10 text-primary" },
          { label: "Referral Conversions", value: "61", icon: UserPlus, color: "bg-emerald-50 text-emerald-600" },
          { label: "Referral Revenue (MTD)", value: "$48,800", icon: TrendingUp, color: "bg-violet-50 text-violet-600" },
          { label: "Active Referring MDs", value: "12", icon: Building2, color: "bg-amber-50 text-amber-600" },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-xl font-heading font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading font-semibold mb-4">Referrals by Source (6 Months)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} />
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid hsl(214,32%,91%)", fontSize: 12 }} />
              <Bar dataKey="physician" fill="hsl(217,91%,60%)" radius={[4,4,0,0]} name="Physician" />
              <Bar dataKey="patient" fill="hsl(172,66%,50%)" radius={[4,4,0,0]} name="Patient" />
              <Bar dataKey="marketing" fill="hsl(262,83%,58%)" radius={[4,4,0,0]} name="Marketing" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-6">
          <h3 className="font-heading font-semibold mb-4">Referral Mix</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {sourceData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid hsl(214,32%,91%)", fontSize: 12 }} formatter={(v) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {sourceData.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                  <span>{s.name}</span>
                </div>
                <span className="font-medium">{s.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="physician">Physician Referrals</TabsTrigger>
          <TabsTrigger value="patient">Patient Referrals</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "physician" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="font-heading font-semibold">Referring Physicians</h3>
            <Button onClick={() => setShowRequestDialog(true)} variant="outline" size="sm" className="gap-2"><Building2 className="w-3.5 h-3.5" />Add Physician</Button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Physician</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Referrals Sent</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Converted</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Revenue Generated</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Conversion Rate</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {physicianReferrals.map((r, i) => (
                <tr key={i} className="border-t border-border hover:bg-muted/20">
                  <td className="p-4">
                    <p className="font-medium">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.practice}</p>
                  </td>
                  <td className="p-4">{r.referrals}</td>
                  <td className="p-4">{r.conversions}</td>
                  <td className="p-4 font-medium">${r.revenue.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Progress value={Math.round(r.conversions / r.referrals * 100)} className="w-16 h-1.5" />
                      <span>{Math.round(r.conversions / r.referrals * 100)}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge className={r.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}>
                      {r.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {tab === "patient" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border">
            <h3 className="font-heading font-semibold">Patient Referral Champions</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground">Patient</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Referred</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Converted</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Reward Status</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {patientReferrals.map((r, i) => (
                <tr key={i} className="border-t border-border hover:bg-muted/20">
                  <td className="p-4 font-medium">{r.name}</td>
                  <td className="p-4">{r.referred}</td>
                  <td className="p-4">{r.converted}</td>
                  <td className="p-4">
                    <Badge className={r.rewardStatus === "sent" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                      {r.rewardStatus === "sent" ? "Reward Sent" : "Pending"}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                   <Button onClick={() => setShowRequestDialog(true)} variant="ghost" size="sm">Send Thank You</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {tab === "automation" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Post-Visit Referral Request", desc: "Automatically send referral request SMS/email to satisfied patients 24h after visit.", status: "active", trigger: "After visit (rating ≥ 4★)" },
            { title: "Physician Appreciation Campaign", desc: "Monthly thank-you email with referral stats sent to top referring physicians.", status: "active", trigger: "1st of each month" },
            { title: "Referral Follow-up Sequence", desc: "3-touch follow-up series for referred leads who haven't booked yet.", status: "active", trigger: "Referral received, no booking in 72h" },
            { title: "Referral Reward Automation", desc: "Automatically issue gift cards or rewards when patient referrals convert.", status: "paused", trigger: "Referral converts to appointment" },
          ].map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{a.desc}</p>
                  <p className="text-xs text-primary mt-2">Trigger: {a.trigger}</p>
                </div>
                <Badge className={a.status === "active" ? "bg-emerald-100 text-emerald-700 shrink-0" : "bg-muted text-muted-foreground shrink-0"}>
                  {a.status}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}