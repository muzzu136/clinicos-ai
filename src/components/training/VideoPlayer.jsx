import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

const lessonVideos = {
  "Welcome to ClinicOS AI": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "Dashboard Overview & Navigation": "https://www.youtube.com/embed/jNQXAC9IVRw",
  "Setting Up Your Clinic Profile": "https://www.youtube.com/embed/9bZkp7q19f0",
  "Connecting Your EHR System": "https://www.youtube.com/embed/MYfZeDPK64s",
  "Understanding the A/R Dashboard": "https://www.youtube.com/embed/kJQP7kiw9Fk",
  "How the AI Claim Scrubber Works": "https://www.youtube.com/embed/ZZ5B3TgoDiY",
  "Real-Time Eligibility Verification": "https://www.youtube.com/embed/tYzMGcUty6s",
  "Denial Management & Auto-Appeals": "https://www.youtube.com/embed/KOxbO0ZN4nE",
  "Reading Your Payer Performance Report": "https://www.youtube.com/embed/aqz-KE-bpKQ",
  "Patient Churn Risk Scoring": "https://www.youtube.com/embed/xvFZjo5PgG0",
  "Launching Your First AI Campaign": "https://www.youtube.com/embed/Yl-Ox7ajz4A",
  "Referral Network Automation": "https://www.youtube.com/embed/KO-m8L-SaJk",
  "Reputation & Review Management": "https://www.youtube.com/embed/4zqZUkpPu20",
  "How the AI Receptionist Handles Calls": "https://www.youtube.com/embed/Lp-Y4CUy0QE",
  "Configuring Call Flows & Scripts": "https://www.youtube.com/embed/1dJHaI2B7Xo",
  "Missed Call Recovery & Follow-Up": "https://www.youtube.com/embed/oHg5SJYRHA0",
  "Asking the AI Copilot the Right Questions": "https://www.youtube.com/embed/j5a0jTc9S0E",
  "Interpreting AI Business Reports": "https://www.youtube.com/embed/qhbuKbxJsk8",
  "Setting KPI Targets & Tracking Progress": "https://www.youtube.com/embed/K5KAc_DtXbE",
  "Predictive Revenue Forecasting": "https://www.youtube.com/embed/PL6gx4Dj-JE",
  "Staff Productivity Analytics": "https://www.youtube.com/embed/YQHsXMglC9A",
  "Multi-Location Benchmarking": "https://www.youtube.com/embed/dxCFCRF0g8w"
};

export default function VideoPlayer({ open, lessonTitle, onClose, onComplete }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoUrl = lessonVideos[lessonTitle] || "https://www.youtube.com/embed/dQw4w9WgXcQ";

  const handleComplete = () => {
    onComplete?.();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-card rounded-xl overflow-hidden w-full transition-all ${isFullscreen ? "max-w-none h-screen rounded-none" : "max-w-4xl"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-muted/50 border-b border-border">
          <h3 className="font-semibold truncate">{lessonTitle}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              <Maximize className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Container */}
        <div className={`bg-black relative ${isFullscreen ? "h-screen" : "aspect-video"}`}>
          <iframe
            width="100%"
            height="100%"
            src={videoUrl}
            title={lessonTitle}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        {/* Footer */}
        {!isFullscreen && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/30">
            <p className="text-sm text-muted-foreground">Finish watching to mark as complete</p>
            <Button onClick={handleComplete} className="gap-2">
              Mark as Complete
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}