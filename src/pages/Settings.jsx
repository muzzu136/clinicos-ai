import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings2, Building2, Shield, Bell, Users,
  CheckCircle2, Plug, Key, Loader2
} from "lucide-react";
import IntegrationConnectDialog from "@/components/dialogs/IntegrationConnectDialog";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";
import { toast } from "sonner";

const integrations = [
  { category: "EHR / PM Systems", items: [
    { name: "Tebra (Kareo)", logo: "🏥", connected: true, desc: "Patient records, appointments, billing sync" },
    { name: "DrChrono", logo: "📋", connected: false, desc: "EHR & practice management" },
    { name: "Athenahealth", logo: "⚕️", connected: false, desc: "Cloud-based EHR platform" },
    { name: "AdvancedMD", logo: "💊", connected: false, desc: "Medical billing & scheduling" },
    { name: "NextGen Healthcare", logo: "🔬", connected: false, desc: "Specialty-focused EHR" },
    { name: "eClinicalWorks", logo: "🩺", connected: false, desc: "EHR for multi-specialty" },
  ]},
  { category: "Communication", items: [
    { name: "Twilio SMS", logo: "📱", connected: true, desc: "SMS campaigns & reminders" },
    { name: "RingCentral", logo: "📞", connected: true, desc: "VOIP & call intelligence" },
    { name: "Zoom", logo: "💻", connected: false, desc: "Telehealth video visits" },
  ]},
  { category: "Billing & Payments", items: [
    { name: "Stripe", logo: "💳", connected: true, desc: "Patient payments & billing" },
    { name: "Square", logo: "🔲", connected: false, desc: "In-person POS payments" },
    { name: "Authorize.net", logo: "🏦", connected: false, desc: "Payment gateway" },
  ]},
  { category: "Clearinghouses", items: [
    { name: "Availity", logo: "🔄", connected: true, desc: "Eligibility & claim submission" },
    { name: "Waystar", logo: "📤", connected: false, desc: "Revenue cycle clearinghouse" },
    { name: "Change Healthcare", logo: "🔀", connected: false, desc: "Claims processing & analytics" },
  ]},
  { category: "Calendars", items: [
    { name: "Google Calendar", logo: "📅", connected: true, desc: "Provider schedule sync" },
    { name: "Microsoft Outlook", logo: "📧", connected: false, desc: "Staff calendar sync" },
  ]},
];

const defaultNotifications = [
  { label: "Daily AI Summary Email", desc: "Receive morning executive briefing", enabled: true },
  { label: "Denied Claim Alerts", desc: "Notify when new claims are denied", enabled: true },
  { label: "High Churn Risk Alerts", desc: "Alert when patient churn risk exceeds 70%", enabled: true },
  { label: "No-Show Predictions", desc: "Notify front desk of predicted no-shows", enabled: false },
  { label: "Weekly Performance Report", desc: "Every Monday morning", enabled: true },
  { label: "Revenue Milestone Alerts", desc: "Celebrate revenue milestones", enabled: false },
];

const DAYS = ["Monday–Friday", "Saturday", "Sunday"];
const SPECIALTIES = ["Family Medicine", "Internal Medicine", "Pediatrics", "Urgent Care", "Mental Health", "Women's Health"];

export default function Settings() {
  const { clinic, clinicId, reload: reloadClinic } = useClinic();
  const [tab, setTab] = useState("clinic");
  const [notifState, setNotifState] = useState(defaultNotifications);
  const [showConnectDialog, setShowConnectDialog] = useState(null);
  const [connectedIntegrations, setConnectedIntegrations] = useState({
    "Tebra (Kareo)": true, "Twilio SMS": true, "RingCentral": true,
    "Stripe": true, "Availity": true, "Google Calendar": true,
  });

  // Clinic profile form state
  const [profile, setProfile] = useState({
    name: "", npi: "", tax_id: "", address: "", phone: "", website: "",
  });
  const [hours, setHours] = useState({ "Monday–Friday": { open: "", close: "" }, Saturday: { open: "", close: "" }, Sunday: { open: "", close: "" } });
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [profileSaving, setProfileSaving] = useState(false);
  const [hoursSaving, setHoursSaving] = useState(false);

  // Pre-populate form from clinic data
  useEffect(() => {
    if (!clinic) return;
    setProfile({
      name: clinic.name || "",
      npi: clinic.npi || "",
      tax_id: clinic.tax_id || "",
      address: clinic.address || "",
      phone: clinic.phone || "",
      website: clinic.website || "",
    });
    if (clinic.operating_hours) setHours(prev => ({ ...prev, ...clinic.operating_hours }));
    if (clinic.specialties) setSelectedSpecialties(clinic.specialties);
    if (clinic.integrations) setConnectedIntegrations(prev => ({ ...prev, ...clinic.integrations }));
    if (clinic.notification_prefs) {
      setNotifState(prev => prev.map(n => ({
        ...n,
        enabled: clinic.notification_prefs[n.label] ?? n.enabled,
      })));
    }
  }, [clinic]);

  const handleSaveProfile = async () => {
    if (!clinicId) return;
    setProfileSaving(true);
    try {
      await base44.entities.Clinic.update(clinicId, {
        ...profile,
        specialties: selectedSpecialties,
      });
      reloadClinic();
      toast.success("Clinic profile saved successfully.");
    } catch (e) {
      toast.error("Failed to save profile: " + (e.message || "Unknown error"));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveHours = async () => {
    if (!clinicId) return;
    setHoursSaving(true);
    try {
      await base44.entities.Clinic.update(clinicId, { operating_hours: hours });
      toast.success("Operating hours saved.");
    } catch (e) {
      toast.error("Failed to save hours: " + (e.message || "Unknown error"));
    } finally {
      setHoursSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!clinicId) return;
    const prefs = {};
    notifState.forEach(n => { prefs[n.label] = n.enabled; });
    try {
      await base44.entities.Clinic.update(clinicId, { notification_prefs: prefs });
      toast.success("Notification preferences saved.");
    } catch (e) {
      toast.error("Failed to save notifications: " + (e.message || "Unknown error"));
    }
  };

  const toggleSpecialty = (s) => {
    setSelectedSpecialties(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleIntegrationConnect = async (service) => {
    setConnectedIntegrations(prev => ({ ...prev, [service]: true }));
    if (clinicId) {
      try {
        await base44.entities.Clinic.update(clinicId, {
          integrations: { ...connectedIntegrations, [service]: true },
        });
      } catch (e) {
        console.error("Failed to persist integration:", e);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-heading font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your clinic profile, integrations, and preferences</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="clinic">Clinic Profile</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security & HIPAA</TabsTrigger>
          <TabsTrigger value="billing">Plan & Billing</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "clinic" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-primary" />
              <h3 className="font-heading font-semibold">Clinic Information</h3>
            </div>
            {[
              { label: "Clinic Name", key: "name", placeholder: "Downtown Medical Clinic" },
              { label: "NPI Number", key: "npi", placeholder: "1234567890" },
              { label: "Tax ID (EIN)", key: "tax_id", placeholder: "XX-XXXXXXX" },
              { label: "Address", key: "address", placeholder: "123 Main St, Chicago IL 60601" },
              { label: "Phone", key: "phone", placeholder: "(555) 123-4567" },
              { label: "Website", key: "website", placeholder: "https://yourclinic.com" },
            ].map((field) => (
              <div key={field.key}>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{field.label}</label>
                <Input
                  className="mt-1"
                  placeholder={field.placeholder}
                  value={profile[field.key]}
                  onChange={e => setProfile(prev => ({ ...prev, [field.key]: e.target.value }))}
                />
              </div>
            ))}
            <Button onClick={handleSaveProfile} className="w-full gap-2" disabled={profileSaving}>
              {profileSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Clinic Profile
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-heading font-semibold">Clinic Specialties</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((s) => (
                <Badge
                  key={s}
                  variant="outline"
                  onClick={() => toggleSpecialty(s)}
                  className={`cursor-pointer transition-colors ${selectedSpecialties.includes(s) ? "bg-primary text-primary-foreground" : "hover:bg-primary/10"}`}
                >{s}</Badge>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-4 mb-2">
              <Settings2 className="w-5 h-5 text-primary" />
              <h3 className="font-heading font-semibold">Operating Hours</h3>
            </div>
            {DAYS.map((day) => (
              <div key={day} className="flex items-center gap-3">
                <span className="text-sm w-32 shrink-0">{day}</span>
                <Input
                  placeholder="8:00 AM"
                  className="w-24"
                  value={hours[day]?.open || ""}
                  onChange={e => setHours(prev => ({ ...prev, [day]: { ...prev[day], open: e.target.value } }))}
                />
                <span className="text-muted-foreground text-sm">to</span>
                <Input
                  placeholder="6:00 PM"
                  className="w-24"
                  value={hours[day]?.close || ""}
                  onChange={e => setHours(prev => ({ ...prev, [day]: { ...prev[day], close: e.target.value } }))}
                />
              </div>
            ))}
            <Button onClick={handleSaveHours} className="w-full mt-2 gap-2" disabled={hoursSaving}>
              {hoursSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Hours
            </Button>
          </motion.div>
        </div>
      )}

      {tab === "integrations" && (
        <>
          <div className="space-y-8">
            {integrations.map((group, gi) => (
              <div key={gi}>
                <h3 className="font-heading font-semibold text-sm uppercase tracking-widest text-muted-foreground mb-3">{group.category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.items.map((item, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
                      <span className="text-2xl">{item.logo}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                      </div>
                      {connectedIntegrations[item.name] ? (
                        <div className="flex items-center gap-1 text-xs text-emerald-600 shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Connected</span>
                        </div>
                      ) : (
                        <Button onClick={() => setShowConnectDialog(item.name)} size="sm" variant="outline" className="shrink-0 gap-1 text-xs">
                          <Plug className="w-3 h-3" />Connect
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <IntegrationConnectDialog
            open={!!showConnectDialog}
            integration={showConnectDialog}
            onClose={() => setShowConnectDialog(null)}
            onConnect={handleIntegrationConnect}
          />
        </>
      )}

      {tab === "notifications" && (
        <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
          {notifState.map((n, i) => (
            <div key={i} className="p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-sm">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              <button
                onClick={() => setNotifState(prev => prev.map((item, j) => j === i ? { ...item, enabled: !item.enabled } : item))}
                className={`relative w-11 h-6 rounded-full transition-colors ${n.enabled ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${n.enabled ? "left-6" : "left-1"}`} />
              </button>
            </div>
          ))}
          <div className="p-4">
            <Button onClick={handleSaveNotifications} className="w-full">Save Notification Preferences</Button>
          </div>
        </div>
      )}

      {tab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            { icon: Shield, title: "HIPAA Compliance", items: ["Business Associate Agreement (BAA) — Active", "End-to-End Encryption — Enabled", "Audit Trail Logging — Active", "Data Retention Policy — 7 years"], status: "compliant" },
            { icon: Key, title: "Access & Authentication", items: ["Multi-Factor Authentication (MFA) — Required", "Single Sign-On (SSO) — Configured", "Role-Based Access Control (RBAC) — Active", "Session Timeout — 30 minutes"], status: "compliant" },
            { icon: Shield, title: "SOC 2 Type II", items: ["Annual Audit — Passed (2025)", "Penetration Testing — Quarterly", "Vulnerability Scanning — Weekly", "Incident Response Plan — Active"], status: "compliant" },
            { icon: Users, title: "User Roles & Permissions", items: ["Admin — Full access", "Provider — Patient & clinical data", "Biller — Financial & claims only", "Front Desk — Scheduling & comms"], status: "configured" },
          ].map((section, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <section.icon className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{section.title}</h3>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700">{section.status}</Badge>
              </div>
              <div className="space-y-2">
                {section.items.map((item, j) => (
                  <div key={j} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {tab === "billing" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <Badge className="bg-primary text-primary-foreground mb-2">Professional Plan — Active</Badge>
                <h3 className="text-2xl font-heading font-bold">$1,499 / month</h3>
                <p className="text-sm text-muted-foreground mt-1">Billed monthly · Next renewal: July 4, 2026</p>
              </div>
              <Button variant="outline">Upgrade to Enterprise</Button>
            </div>
          </div>

          <div>
            <h3 className="font-heading font-semibold mb-3">Subscription Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Starter", price: "$299", period: "/mo", features: ["Up to 1 provider", "Core scheduling", "Basic RCM", "Email support"], current: false, highlight: false },
                { name: "Growth", price: "$699", period: "/mo", features: ["Up to 3 providers", "AI campaigns", "Reputation mgmt", "Call intelligence"], current: false, highlight: false },
                { name: "Professional", price: "$1,499", period: "/mo", features: ["Up to 6 providers", "Full RCM suite", "Predictive analytics", "AI Copilot"], current: true, highlight: true },
                { name: "Enterprise", price: "$2,999+", period: "/mo", features: ["Unlimited providers", "Multi-location", "White label", "Dedicated CSM"], current: false, highlight: false },
              ].map((plan, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className={`rounded-xl border p-5 ${plan.highlight ? "border-primary ring-1 ring-primary bg-primary/5" : "border-border bg-card"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-heading font-bold">{plan.name}</p>
                    {plan.current && <Badge className="bg-primary text-primary-foreground text-xs">Current</Badge>}
                  </div>
                  <p className="text-2xl font-heading font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">{plan.period}</span></p>
                  <div className="space-y-1.5 mt-3 mb-4">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />{f}
                      </div>
                    ))}
                  </div>
                  <Button size="sm" className="w-full" variant={plan.current ? "outline" : "default"} disabled={plan.current}>
                    {plan.current ? "Current Plan" : "Switch Plan"}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
