import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  PlayCircle, CheckCircle2, Lock, BookOpen, Zap, BarChart3,
  Users, DollarSign, Phone, Star, BrainCircuit, ChevronRight,
  Award, Clock, Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

const modules = [
  {
    category: "Getting Started",
    color: "bg-emerald-50 text-emerald-600",
    accent: "hsl(172, 66%, 50%)",
    icon: BookOpen,
    lessons: [
      { title: "Welcome to ClinicOS AI", duration: "3 min", completed: true, type: "video" },
      { title: "Dashboard Overview & Navigation", duration: "5 min", completed: true, type: "video" },
      { title: "Setting Up Your Clinic Profile", duration: "4 min", completed: true, type: "interactive" },
      { title: "Connecting Your EHR System", duration: "6 min", completed: false, type: "video" },
      { title: "Inviting Your Team", duration: "3 min", completed: false, type: "guide" },
    ]
  },
  {
    category: "Revenue Cycle Management",
    color: "bg-primary/10 text-primary",
    accent: "hsl(217, 91%, 60%)",
    icon: DollarSign,
    lessons: [
      { title: "Understanding the A/R Dashboard", duration: "7 min", completed: false, type: "video" },
      { title: "How the AI Claim Scrubber Works", duration: "5 min", completed: false, type: "video" },
      { title: "Real-Time Eligibility Verification", duration: "6 min", completed: false, type: "interactive" },
      { title: "Denial Management & Auto-Appeals", duration: "8 min", completed: false, type: "video" },
      { title: "Reading Your Payer Performance Report", duration: "5 min", completed: false, type: "guide" },
    ]
  },
  {
    category: "Patient Growth & Retention",
    color: "bg-violet-50 text-violet-600",
    accent: "hsl(262, 83%, 58%)",
    icon: Users,
    lessons: [
      { title: "Patient Churn Risk Scoring", duration: "5 min", completed: false, type: "video" },
      { title: "Launching Your First AI Campaign", duration: "7 min", completed: false, type: "interactive" },
      { title: "Referral Network Automation", duration: "6 min", completed: false, type: "video" },
      { title: "Reputation & Review Management", duration: "4 min", completed: false, type: "guide" },
    ]
  },
  {
    category: "AI Voice Receptionist",
    color: "bg-amber-50 text-amber-600",
    accent: "hsl(38, 92%, 50%)",
    icon: Phone,
    lessons: [
      { title: "How the AI Receptionist Handles Calls", duration: "6 min", completed: false, type: "video" },
      { title: "Configuring Call Flows & Scripts", duration: "8 min", completed: false, type: "interactive" },
      { title: "Missed Call Recovery & Follow-Up", duration: "5 min", completed: false, type: "video" },
    ]
  },
  {
    category: "AI Copilot & Consulting",
    color: "bg-indigo-50 text-indigo-600",
    accent: "hsl(262, 83%, 58%)",
    icon: BrainCircuit,
    lessons: [
      { title: "Asking the AI Copilot the Right Questions", duration: "5 min", completed: false, type: "video" },
      { title: "Interpreting AI Business Reports", duration: "7 min", completed: false, type: "guide" },
      { title: "Setting KPI Targets & Tracking Progress", duration: "6 min", completed: false, type: "interactive" },
    ]
  },
  {
    category: "Analytics & Reporting",
    color: "bg-sky-50 text-sky-600",
    accent: "hsl(200, 80%, 55%)",
    icon: BarChart3,
    lessons: [
      { title: "Predictive Revenue Forecasting", duration: "6 min", completed: false, type: "video" },
      { title: "Staff Productivity Analytics", duration: "5 min", completed: false, type: "guide" },
      { title: "Multi-Location Benchmarking", duration: "7 min", completed: false, type: "video" },
    ]
  },
];

const typeConfig = {
  video: { label: "Video", color: "bg-primary/10 text-primary" },
  interactive: { label: "Interactive", color: "bg-emerald-100 text-emerald-700" },
  guide: { label: "Guide", color: "bg-amber-100 text-amber-700" },
};

const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);

export default function Training() {
  const [search, setSearch] = useState("");
  const [activeModule, setActiveModule] = useState(null);
  const [lessons, setLessons] = useState(modules);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progress = await base44.entities.TrainingProgress.list();
        const progressMap = {};
        progress.forEach(p => {
          progressMap[`${p.module_category}|${p.lesson_title}`] = p.completed;
        });

        const updatedModules = modules.map(m => ({
          ...m,
          lessons: m.lessons.map(l => ({
            ...l,
            completed: progressMap[`${m.category}|${l.title}`] ?? l.completed
          }))
        }));
        setLessons(updatedModules);
      } catch (e) {
        console.error("Failed to load training progress:", e);
      }
      setLoading(false);
    };
    loadProgress();
  }, []);

  const saveProgress = async (moduleCategory, lessonTitle, completed) => {
    try {
      const existing = await base44.entities.TrainingProgress.filter({
        module_category: moduleCategory,
        lesson_title: lessonTitle
      });

      if (existing.length > 0) {
        await base44.entities.TrainingProgress.update(existing[0].id, { completed });
      } else {
        await base44.entities.TrainingProgress.create({
          module_category: moduleCategory,
          lesson_title: lessonTitle,
          completed
        });
      }
    } catch (e) {
      console.error("Failed to save progress:", e);
    }
  };

  const completedLessons = lessons.reduce((s, m) => s + m.lessons.filter(l => l.completed).length, 0);
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);

  const filtered = lessons.filter(m =>
    m.category.toLowerCase().includes(search.toLowerCase()) ||
    m.lessons.some(l => l.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold">Training Center</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Learn ClinicOS AI — step by step, at your own pace</p>
        </div>
        <div className="flex items-center gap-3">
          <Award className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium">{completedLessons}/{totalLessons} lessons complete</span>
        </div>
      </div>

      {/* Overall Progress */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 via-accent/5 to-violet-50 border border-primary/20 rounded-2xl p-6">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-heading font-semibold">Your Progress</span>
              <span className="text-2xl font-heading font-bold text-primary">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">Keep going — you're on your way to becoming a ClinicOS AI expert!</p>
          </div>
          <div className="flex gap-8 text-center">
            {[
              { label: "Completed", value: completedLessons, color: "text-emerald-600" },
              { label: "Remaining", value: totalLessons - completedLessons, color: "text-primary" },
              { label: "Modules", value: modules.length, color: "text-foreground" },
            ].map((stat, i) => (
              <div key={i}>
                <p className={`text-2xl font-heading font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          {overallProgress === 100 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-semibold text-amber-700">Certified ClinicOS User!</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search lessons..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((mod, mi) => {
          const modCompleted = mod.lessons.filter(l => l.completed).length;
          const modProgress = Math.round((modCompleted / mod.lessons.length) * 100);
          const isOpen = activeModule === mi;
          const Icon = mod.icon;

          return (
            <motion.div key={mi} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: mi * 0.06 }}
              className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Module Header */}
              <button
                onClick={() => setActiveModule(isOpen ? null : mi)}
                className="w-full p-5 flex items-center gap-4 hover:bg-muted/30 transition-colors text-left"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${mod.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold">{mod.category}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <Progress value={modProgress} className="h-1.5 flex-1 max-w-[120px]" />
                    <span className="text-xs text-muted-foreground">{modCompleted}/{mod.lessons.length} done</span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90" : ""}`} />
              </button>

              {/* Lessons */}
              {isOpen && (
                <div className="border-t border-border divide-y divide-border">
                  {mod.lessons.map((lesson, li) => (
                    <motion.div key={li} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: li * 0.04 }}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors">
                      <div className="shrink-0">
                        {lesson.completed
                          ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          : <PlayCircle className="w-5 h-5 text-muted-foreground" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${lesson.completed ? "line-through text-muted-foreground" : ""}`}>{lesson.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{lesson.duration}</span>
                          <Badge className={`text-[10px] ${typeConfig[lesson.type].color}`}>{typeConfig[lesson.type].label}</Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={lesson.completed ? "ghost" : "outline"}
                        className="shrink-0 text-xs h-7"
                        onClick={() => {
                          const newCompleted = !lesson.completed;
                          setLessons(prev => prev.map(m => m.category === mod.category ? {
                            ...m,
                            lessons: m.lessons.map(l => l.title === lesson.title ? { ...l, completed: newCompleted } : l)
                          } : m));
                          saveProgress(mod.category, lesson.title, newCompleted);
                        }}
                      >
                        {lesson.completed ? "Undo" : "Mark Complete"}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Module footer CTA */}
              {!isOpen && modCompleted === 0 && (
                <div className="px-5 pb-4">
                  <Button size="sm" variant="ghost" className="gap-2 text-primary text-xs" onClick={() => setActiveModule(mi)}>
                    <Zap className="w-3 h-3" /> Start Module
                  </Button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Quick Tips */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="font-heading font-semibold">Quick Tips</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { tip: "Start with the Dashboard", desc: "Check the AI Daily Summary every morning — it surfaces your top 3 priorities automatically." },
            { tip: "Run Eligibility Before Every Appointment", desc: "Use the Eligibility Checker the night before to avoid billing surprises and speed up collections." },
            { tip: "Let AI Handle Denials", desc: "Enable AI Auto-Appeal in Revenue Cycle — 78% of eligible claims get recovered without staff intervention." },
          ].map((t, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-sm font-semibold mb-1">{t.tip}</p>
              <p className="text-xs text-white/60 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}