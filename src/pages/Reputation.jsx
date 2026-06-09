import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ThumbsUp, ThumbsDown, MessageSquare, TrendingUp, ExternalLink, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";
import { toast } from "sonner";

const platforms = [
  { name: "Google", rating: 4.8, count: 247, trend: "+12 this month", color: "bg-primary/10 text-primary" },
  { name: "Healthgrades", rating: 4.7, count: 89, trend: "+5 this month", color: "bg-emerald-50 text-emerald-600" },
  { name: "Facebook", rating: 4.6, count: 134, trend: "+8 this month", color: "bg-blue-50 text-blue-600" },
  { name: "Yelp", rating: 4.3, count: 56, trend: "+3 this month", color: "bg-red-50 text-red-600" },
];

const reviews = [
  { platform: "Google", patient: "John M.", rating: 5, date: "Nov 22, 2024", text: "Dr. Martinez is amazing! The staff was so friendly and the AI scheduling made everything seamless.", sentiment: "positive", responded: true },
  { platform: "Healthgrades", patient: "Amy L.", rating: 5, date: "Nov 20, 2024", text: "Best clinic experience I've had. Minimal wait time and thorough examination.", sentiment: "positive", responded: false },
  { platform: "Google", patient: "Mark S.", rating: 2, date: "Nov 19, 2024", text: "Had to wait 45 minutes past my appointment time. Front desk was overwhelmed.", sentiment: "negative", responded: false },
  { platform: "Facebook", patient: "Sarah K.", rating: 4, date: "Nov 18, 2024", text: "Good overall experience. The telehealth option was very convenient.", sentiment: "positive", responded: true },
  { platform: "Yelp", patient: "Tom B.", rating: 1, date: "Nov 17, 2024", text: "Billing issues with my insurance. Still waiting for resolution after 3 weeks.", sentiment: "negative", responded: false },
];

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} className={cn("w-3.5 h-3.5", i <= rating ? "fill-amber-400 text-amber-400" : "text-muted")} />
    ))}
  </div>
);

export default function Reputation() {
  const { clinicId } = useClinic();
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [generatedReply, setGeneratedReply] = useState("");

  const generateAIReply = async (review) => {
    setSelectedReview(review);
    setGeneratedReply("Generating AI response...");
    setTimeout(() => {
      const replies = {
        positive: `Thank you so much for the wonderful review! We truly appreciate your kind words and are thrilled that ${review.patient} had such a positive experience. Your satisfaction is our greatest reward!`,
        negative: `We sincerely apologize for the experience ${review.patient} had. Your feedback is invaluable to us. We'd like to make this right — please contact us directly at [clinic contact] so we can address your concerns.`
      };
      setGeneratedReply(replies[review.sentiment]);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Online Reputation</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monitor, manage & grow your clinic's online presence</p>
        </div>
        <Button onClick={() => setShowAIGenerator(true)} className="gap-2">
          <BrainCircuit className="w-4 h-4" /> AI Response Generator
        </Button>
        {showAIGenerator && selectedReview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-xl p-6 max-w-md w-full">
              <h2 className="text-lg font-semibold mb-4">AI-Generated Reply</h2>
              <div className="bg-muted/30 p-3 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground mb-2">Original Review:</p>
                <p className="text-sm font-medium">{selectedReview.text}</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-lg mb-4 border border-emerald-200">
                <p className="text-sm text-emerald-700">{generatedReply}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setShowAIGenerator(false); setSelectedReview(null); }} className="flex-1">Close</Button>
                <Button onClick={async () => { try { await base44.functions.invoke("awsReputation", { action: "post_reply", clinic_id: clinicId, review_id: selectedReview?.id, reply: aiReply }); toast.success("Reply posted successfully!"); } catch(e) { toast.error("Failed to post reply: " + (e.message || "Try again.")); } setShowAIGenerator(false); setSelectedReview(null); }} className="flex-1">Post Reply</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {platforms.map((platform, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">{platform.name}</span>
              <Badge className={platform.color}>{platform.count} reviews</Badge>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-heading font-bold">{platform.rating}</span>
              <StarRating rating={Math.round(platform.rating)} />
            </div>
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {platform.trend}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Reviews */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-card rounded-2xl border border-border p-6">
        <h3 className="font-heading font-semibold mb-4">Recent Reviews</h3>
        <div className="space-y-3">
          {reviews.map((review, i) => (
            <div key={i} className={cn(
              "p-4 rounded-xl border transition-colors",
              review.sentiment === "negative" ? "border-red-200/50 bg-red-50/20" : "border-border hover:border-primary/20"
            )}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">{review.platform}</Badge>
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-muted-foreground">{review.patient}</span>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  {review.responded ? (
                   <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Responded</Badge>
                  ) : (
                   <Button size="sm" variant="outline" className="text-xs gap-1 h-7" onClick={() => { setShowAIGenerator(true); generateAIReply(review); }}>
                     <BrainCircuit className="w-3 h-3" /> AI Reply
                   </Button>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}