import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Play, Pause, Volume2, VolumeX, Maximize } from "lucide-react";

const lessonVideos = {
  "Welcome to ClinicOS AI": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/18fc68dfe_generated_video.mp4",
  "Dashboard Overview & Navigation": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/18373a758_generated_video.mp4",
  "Setting Up Your Clinic Profile": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/a1a2fcf12_generated_video.mp4",
  "Connecting Your EHR System": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/d13005bee_generated_video.mp4",
  "Understanding the A/R Dashboard": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/0ff77d5d9_generated_video.mp4",
  "How the AI Claim Scrubber Works": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/336d5f076_generated_video.mp4",
  "Real-Time Eligibility Verification": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/66e132081_generated_video.mp4",
  "Denial Management & Auto-Appeals": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/72e56be75_generated_video.mp4",
  "Reading Your Payer Performance Report": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/6b17a7a2e_generated_video.mp4",
  "Patient Churn Risk Scoring": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/b0669f717_generated_video.mp4",
  "Launching Your First AI Campaign": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/87bd83317_generated_video.mp4",
  "Referral Network Automation": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/eff6bf347_generated_video.mp4",
  "Reputation & Review Management": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/2ef3bf5aa_generated_video.mp4",
  "How the AI Receptionist Handles Calls": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/19ce02eb9_generated_video.mp4",
  "Configuring Call Flows & Scripts": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/10ddc3876_generated_video.mp4",
  "Missed Call Recovery & Follow-Up": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/71885f458_generated_video.mp4",
  "Asking the AI Copilot the Right Questions": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/a477aede0_generated_video.mp4",
  "Interpreting AI Business Reports": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/8b21cd8e1_generated_video.mp4",
  "Setting KPI Targets & Tracking Progress": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/05718363d_generated_video.mp4",
  "Predictive Revenue Forecasting": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/680ed636b_generated_video.mp4",
  "Staff Productivity Analytics": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/672c78dc5_generated_video.mp4",
  "Multi-Location Benchmarking": "https://media.base44.com/videos/public/6a217ca49d3969e690fe7f0e/dbe1a98c1_generated_video.mp4"
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
          <video
            width="100%"
            height="100%"
            src={videoUrl}
            title={lessonTitle}
            controls
            autoPlay
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