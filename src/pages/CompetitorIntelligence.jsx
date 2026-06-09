import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp, TrendingDown, Star, Globe, Search,
  MapPin, AlertCircle, Lightbulb, Eye, BarChart3
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

const competitors = [
  {
    name: "CityHealth Family Clinic",
    distance: "0.4 mi",
    rating: 4.2,
    reviews: 312,
    services: ["Family Medicine", "Urgent Care"],
    trend: "down",
    strength: "Price",
    weakness: "Wait times",
    threat: "medium"
  },
  {
    name: "Premier Medical Group",
    distance: "1.1 mi",
    rating: 4.6,
    reviews: 891,
    services: ["Internal Medicine", "Cardiology", "Pediatrics"],
    trend: "up",
    strength: "Marketing",
    weakness: "Availability",
    threat: "high"
  },
  {
    name: "QuickCare Urgent Center",
    distance: "0.8 mi",
    rating: 3.9,
    reviews: 156,
    services: ["Urgent Care", "Walk-in"],
    trend: "stable",
    strength: "Convenience",
    weakness: "Quality perception",
    threat: "low"
  },
  {
    name: "Wellness Plus Clinic",
    distance: "1.6 mi",
    rating: 4.4,
    reviews: 428,
    services: ["Family Medicine", "Mental Health"],
    trend: "up",
    strength: "Mental health",
    weakness: "RCM",
    threat: "medium"
  },
];

const radarData = [
  { subject: "Reviews", You: 4.8, TopComp: 4.6 },
  { subject: "Wait Time", You: 85, TopComp: 62 },
  { subject: "Services", You: 78, TopComp: 90 },
  { subject: "Online Presence", You: 72, TopComp: 88 },
  { subject: "Patient Retention", You: 91, TopComp: 74 },
  { subject: "Availability", You: 88, TopComp: 70 },
];

const reviewCompare = [
  { name: "Your Clinic", google: 4.8, yelp: 4.5, healthgrades: 4.9 },
  { name: "CityHealth", google: 4.2, yelp: 4.0, healthgrades: 4.1 },
  { name: "Premier Med", google: 4.6, yelp: 4.4, healthgrades: 4.7 },
  { name: "QuickCare", google: 3.9, yelp: 3.7, healthgrades: 4.0 },
];

const opportunities = [
  { title: "Mental Health Services Gap", desc: "Competitors offer limited mental health services. Adding behavioral health could capture 120+ patients/year.", value: "$84,000 ARR potential", priority: "high" },
  { title: "Evening Hours Advantage", desc: "No competitor offers evening hours past 6 PM. 67% of unbooked leads prefer after-5 PM slots.", value: "$52,000 ARR potential", priority: "high" },
  { title: "Spanish-Language Marketing", desc: "38% local population is Spanish-speaking. No competitor targets this segment.", value: "$38,000 ARR potential", priority: "medium" },
  { title: "Telehealth Expansion", desc: "Competitors have limited telehealth. Expanding virtual care could add 40+ new patients/month.", value: "$29,000 ARR potential", priority: "medium" },
];

const threatColor = { high: "bg-red-100 text-red-700", medium: "bg-amber-100 text-amber-700", low: "bg-emerald-100 text-emerald-700" };

export default function CompetitorIntelligence() {
  const { clinicId } = useClinic();
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  const handleRefreshAnalysis = async () => {
    setLoading(true);
    setTimeout(() => {
      toast.success("Competitor analysis refreshed. Nearby competitors analyzed.");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">Competitor Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-0.5">AI-powered local market analysis & growth opportunities</p>
        </div>
        <Button onClick={handleRefreshAnalysis} disabled={loading} className="gap-2"><Search className="w-4 h-4" />{loading ? "Analyzing..." : "Refresh Analysis"}</Button>
      </div>

      {/* Market Position Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-heading font-semibold">AI Market Position Report</p>
            <p className="text-sm text-muted-foreground mt-1">
              You are the <strong>#1 rated clinic</strong> within 2 miles with a 4.8★ average. Your patient retention score (91%) outperforms all local competitors.
              Primary threat: <strong>Premier Medical Group</strong> is expanding services and increasing ad spend.
            </p>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Competitors</TabsTrigger>
          <TabsTrigger value="comparison">Benchmarking</TabsTrigger>
          <TabsTrigger value="opportunities">Growth Gaps</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {competitors.map((c, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{c.distance}</span>
                  </div>
                </div>
                <Badge className={threatColor[c.threat]}>{c.threat} threat</Badge>
              </div>

              <div className="flex items-center gap-4 text-sm mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-medium">{c.rating}</span>
                  <span className="text-muted-foreground">({c.reviews})</span>
                </div>
                <div className="flex items-center gap-1">
                  {c.trend === "up" ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : c.trend === "down" ? <TrendingDown className="w-3.5 h-3.5 text-red-500" /> : <span className="text-xs text-muted-foreground">→</span>}
                  <span className="text-xs text-muted-foreground capitalize">{c.trend}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {c.services.map((s, j) => <Badge key={j} variant="outline" className="text-xs">{s}</Badge>)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-emerald-50 rounded-lg p-2">
                  <p className="text-muted-foreground">Strength</p>
                  <p className="font-medium text-emerald-700">{c.strength}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-2">
                  <p className="text-muted-foreground">Weakness</p>
                  <p className="font-medium text-red-700">{c.weakness}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {tab === "comparison" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-heading font-semibold mb-4">Competitive Radar</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(214,32%,91%)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} />
                <Radar name="You" dataKey="You" stroke="hsl(217,91%,60%)" fill="hsl(217,91%,60%)" fillOpacity={0.25} />
                <Radar name="Top Competitor" dataKey="TopComp" stroke="hsl(0,84%,60%)" fill="hsl(0,84%,60%)" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 justify-center mt-2 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-primary" /><span>Your Clinic</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /><span>Top Competitor</span></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-6">
            <h3 className="font-heading font-semibold mb-4">Review Score Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reviewCompare} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214,32%,91%)" horizontal={false} />
                <XAxis type="number" domain={[3, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215,16%,47%)" }} width={80} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid hsl(214,32%,91%)", fontSize: 12 }} />
                <Bar dataKey="google" fill="hsl(217,91%,60%)" radius={[0,4,4,0]} name="Google" />
                <Bar dataKey="healthgrades" fill="hsl(172,66%,50%)" radius={[0,4,4,0]} name="Healthgrades" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {tab === "opportunities" && (
        <div className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm">AI has identified <strong>4 revenue gaps</strong> based on competitor weaknesses and local patient demand. Total potential: <strong>$203,000+ ARR</strong>.</p>
          </div>

          {opportunities.map((o, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-sm">{o.title}</p>
                  <Badge className={o.priority === "high" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}>
                    {o.priority} priority
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{o.desc}</p>
                <p className="text-sm font-medium text-emerald-600 mt-2">{o.value}</p>
              </div>
              <Button variant="outline" size="sm">Explore</Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}