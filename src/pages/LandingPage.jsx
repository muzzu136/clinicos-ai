import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BrainCircuit, CheckCircle2, ArrowRight, Menu, X,
  Phone, DollarSign, Users, Calendar, Shield,
  Star, TrendingUp, Zap, BarChart3, FileText,
  MessageSquare, Mic, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Data ──────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Testimonials", href: "#testimonials" },
];

const FEATURES = [
  { icon: BrainCircuit, color: "bg-blue-50 text-blue-600", title: "AI Clinic Copilot", desc: "Ask any question about your clinic's performance and get instant, data-driven answers with actionable recommendations." },
  { icon: Mic, color: "bg-amber-50 text-amber-600", title: "AI Voice Receptionist", desc: "24/7 AI front desk answers calls, books appointments, and handles patient inquiries — automatically, every time." },
  { icon: DollarSign, color: "bg-emerald-50 text-emerald-600", title: "Revenue Cycle Management", desc: "Automated claim scrubbing, denial detection, and AI appeals recover revenue you didn't know you were losing." },
  { icon: FileText, color: "bg-violet-50 text-violet-600", title: "Claim Intelligence", desc: "AI catches billing errors before submission. Fewer denials, faster payments, higher collection rates." },
  { icon: Users, color: "bg-rose-50 text-rose-600", title: "Patient Retention AI", desc: "Predict which patients are at risk of leaving and launch automated re-engagement campaigns before they churn." },
  { icon: BarChart3, color: "bg-cyan-50 text-cyan-600", title: "Predictive Analytics", desc: "Forecast revenue, patient volume, and operational needs weeks in advance with machine learning." },
  { icon: MessageSquare, color: "bg-indigo-50 text-indigo-600", title: "Omnichannel Messaging", desc: "Unified SMS, email, and chat inbox for your whole team. AI drafts responses so staff send in one click." },
  { icon: TrendingUp, color: "bg-orange-50 text-orange-600", title: "Growth & Marketing", desc: "Automated campaigns, referral network management, reputation monitoring, and lead conversion tracking." },
];

const PLANS = [
  {
    name: "Starter", price: 299, period: "/mo",
    description: "Perfect for single-provider clinics getting started.",
    features: ["Up to 500 patients", "AI scheduling & reminders", "Claims processing", "Basic reporting", "Email support"],
    missing: ["AI Voice Receptionist", "Claim Intelligence", "Predictive Analytics"],
    cta: "Start Free Trial", highlight: false,
  },
  {
    name: "Professional", price: 1499, period: "/mo",
    description: "The full ClinicOS AI suite for growing practices.",
    features: ["Up to 6 providers", "Full Revenue Cycle AI", "Claim Intelligence", "AI Copilot", "Predictive Analytics", "Omnichannel messaging", "Priority support"],
    missing: ["Multi-location", "White label"],
    cta: "Start Free Trial", highlight: true, badge: "Most Popular",
  },
  {
    name: "Enterprise", price: null, period: "custom",
    description: "For large health systems and multi-location networks.",
    features: ["Unlimited providers & locations", "Custom EHR integrations", "AI Voice Receptionist included", "White label option", "Dedicated CSM", "SLA guarantees", "Phone support"],
    missing: [],
    cta: "Contact Sales", highlight: false,
  },
];

const TESTIMONIALS = [
  { name: "Dr. Sarah Martinez", role: "Family Medicine, Chicago IL", rating: 5, text: "ClinicOS AI recovered $47,000 in denied claims in our first 3 months. The AI copilot answers questions I used to spend hours researching." },
  { name: "Michael Chen", role: "Practice Manager, Austin TX", rating: 5, text: "Our no-show rate dropped from 18% to 4% after deploying the AI voice receptionist. It paid for itself in the first week." },
  { name: "Dr. Lisa Park", role: "Pediatrics Group, Seattle WA", rating: 5, text: "I finally understand my practice's finances. The dashboards are beautiful and the AI insights catch things my billing team missed for years." },
];

const STATS = [
  { value: "$2.4M+", label: "Revenue recovered for clients" },
  { value: "94%", label: "Average collection rate" },
  { value: "4.8★", label: "Average clinic rating improvement" },
  { value: "68%", label: "Reduction in no-shows" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Sign Up & Connect", desc: "Create your account in minutes. Connect your existing EHR (Tebra, DrChrono, Athena, and 10+ more) in one click." },
  { step: "02", title: "AI Learns Your Clinic", desc: "ClinicOS AI analyzes your historical data, patient patterns, and claim history to build your clinic's intelligence profile." },
  { step: "03", title: "Automate & Optimize", desc: "Watch revenue recover, no-shows drop, and staff productivity soar as AI handles the work that was slowing you down." },
];

// ─── Scroll helper ──────────────────────────────────────────────────────────
const scrollTo = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

// ─── Component ──────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);

  const getPrice = (plan) => {
    if (!plan.price) return "Custom";
    const p = billingAnnual ? Math.round(plan.price * 0.8) : plan.price;
    return `$${p.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* ── NAV ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-gray-900">ClinicOS <span className="text-blue-600">AI</span></span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map(l => (
                <button key={l.label} onClick={() => scrollTo(l.href.slice(1))}
                  className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors">
                  {l.label}
                </button>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">Log in</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-5">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(l => (
                <button key={l.label} onClick={() => { scrollTo(l.href.slice(1)); setMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  {l.label}
                </button>
              ))}
              <div className="pt-3 space-y-2 border-t border-gray-100 mt-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Log in</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Start Free Trial</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50/60 via-white to-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-6 px-4 py-1.5 text-sm font-medium">
                🚀 The AI Operating System for Healthcare Clinics
              </Badge>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
              Run a Smarter Clinic.<br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                Recover More Revenue.
              </span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              ClinicOS AI automates your front desk, billing, patient retention, and analytics — so you can focus on care, not administration.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 h-13 text-base font-semibold shadow-lg shadow-blue-200 gap-2">
                  Start Free 14-Day Trial <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <button onClick={() => scrollTo("how-it-works")}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 h-13 text-base font-semibold text-gray-700 gap-2">
                  See How It Works
                </Button>
              </button>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-5 text-sm text-gray-500">
              No credit card required · Setup in 15 minutes · Cancel anytime
            </motion.p>
          </div>

          {/* Stats strip */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl sm:text-3xl font-extrabold text-blue-600">{s.value}</p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 mb-4">Everything You Need</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">One Platform. Every Clinic Function.</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Replace 6 different software tools with one intelligent platform built specifically for healthcare clinics.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group p-6 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300 cursor-default">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color} group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 mb-4">Simple Onboarding</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Up and running in 15 minutes</h2>
            <p className="text-gray-500 max-w-xl mx-auto">No long implementation. No IT team required. Connect your EHR and ClinicOS AI starts working immediately.</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-8 left-[16.5%] right-[16.5%] h-0.5 bg-gradient-to-r from-blue-200 via-teal-200 to-blue-200" />
            <div className="grid md:grid-cols-3 gap-8">
              {HOW_IT_WORKS.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                  className="text-center relative">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-200 text-xl font-extrabold">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="bg-amber-100 text-amber-700 border-amber-200 mb-4">Loved by Clinics</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Real results from real clinics</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-gray-50 rounded-2xl p-7 border border-gray-100">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-violet-100 text-violet-700 border-violet-200 mb-4">Simple Pricing</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Pick your plan. Start growing today.</h2>
            <p className="text-gray-500 mb-8">All plans include a 14-day free trial. No credit card required.</p>
            {/* Billing toggle */}
            <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full p-1 text-sm">
              <button onClick={() => setBillingAnnual(false)}
                className={`px-5 py-2 rounded-full font-medium transition-colors ${!billingAnnual ? "bg-blue-600 text-white shadow" : "text-gray-500"}`}>Monthly</button>
              <button onClick={() => setBillingAnnual(true)}
                className={`px-5 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${billingAnnual ? "bg-blue-600 text-white shadow" : "text-gray-500"}`}>
                Annual <span className="text-emerald-500 font-bold text-xs">{!billingAnnual && "Save 20%"}</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {PLANS.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`relative flex flex-col rounded-2xl p-8 border-2 transition-shadow ${plan.highlight ? "border-blue-600 bg-white shadow-xl shadow-blue-100" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"}`}>
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{plan.description}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-gray-900">{getPrice(plan)}</span>
                    <span className="text-gray-400 mb-1 text-sm">{plan.period}</span>
                  </div>
                  {billingAnnual && plan.price && (
                    <p className="text-xs text-emerald-600 font-medium mt-1">Save ${Math.round(plan.price * 0.2 * 12).toLocaleString()}/year</p>
                  )}
                </div>

                <Link to={plan.cta === "Contact Sales" ? "mailto:sales@clinicosai.org" : "/register"} className="block mb-6">
                  <Button className={`w-full h-12 font-semibold text-base ${plan.highlight ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200" : "border-gray-300"}`}
                    variant={plan.highlight ? "default" : "outline"}>
                    {plan.cta} <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>

                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                  {plan.missing.map((f, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-gray-400">
                      <span className="w-4 h-4 shrink-0 mt-0.5 text-center leading-none">—</span>{f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Trust signals */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
            {["HIPAA Compliant", "SOC 2 Type II", "256-bit Encryption", "99.9% Uptime SLA", "Cancel Anytime"].map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />{t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Frequently Asked Questions</h2>
          </div>
          {[
            { q: "Do I need to replace my existing EHR?", a: "No. ClinicOS AI connects to your existing EHR (Tebra, DrChrono, Athena, eClinicalWorks, and 10+ more) via secure API integrations. You keep your current system and add AI on top." },
            { q: "Is ClinicOS AI HIPAA compliant?", a: "Yes. ClinicOS AI is fully HIPAA compliant with BAA signing, end-to-end encryption, audit logging, and role-based access controls. We're also SOC 2 Type II certified." },
            { q: "How long does setup take?", a: "Most clinics are up and running in under 15 minutes. Connect your EHR, invite your team, and ClinicOS AI starts learning your clinic immediately." },
            { q: "What if I want to cancel?", a: "Cancel anytime with no penalty. Your data is always yours — we provide a full export within 24 hours of cancellation." },
            { q: "Can I try before I pay?", a: "Yes! Every plan includes a 14-day free trial with full access to all features. No credit card required to start." },
          ].map((item, i) => (
            <div key={i} className="border-b border-gray-100 last:border-0">
              <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left gap-4">
                <span className="font-semibold text-gray-900">{item.q}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${faqOpen === i ? "rotate-180" : ""}`} />
              </button>
              {faqOpen === i && (
                <p className="text-gray-500 text-sm pb-5 leading-relaxed">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 to-teal-500">
        <div className="max-w-3xl mx-auto text-center text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Ready to transform your clinic?</h2>
            <p className="text-blue-100 text-lg mb-8">Join hundreds of clinics recovering revenue, reducing no-shows, and growing with AI.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 h-13 text-base shadow-xl gap-2">
                  Start Free 14-Day Trial <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="mailto:sales@clinicosai.org">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 font-semibold px-8 h-13 text-base">
                  Talk to Sales
                </Button>
              </a>
            </div>
            <p className="mt-5 text-blue-200 text-sm">No credit card required · 14-day free trial · Setup in 15 min</p>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
                  <BrainCircuit className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-white">ClinicOS AI</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">The AI operating system for modern healthcare clinics.</p>
              <p className="text-xs">© 2026 ClinicOS AI. All rights reserved.</p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "How It Works", "Integrations", "Security"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Press", "Contact"] },
              { title: "Legal", links: ["Privacy Policy", "Terms of Service", "HIPAA Policy", "Cookie Policy"] },
            ].map((col, i) => (
              <div key={i}>
                <p className="font-semibold text-white text-sm mb-4">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map(l => (
                    <li key={l}><a href="#" className="text-sm hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <p>HIPAA Compliant · SOC 2 Certified · 256-bit Encryption</p>
            <div className="flex items-center gap-4">
              <a href="mailto:support@clinicosai.org" className="hover:text-white transition-colors">support@clinicosai.org</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
