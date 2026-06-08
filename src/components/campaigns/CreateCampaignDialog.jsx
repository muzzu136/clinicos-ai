import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { X, Loader2 } from "lucide-react";

export default function CreateCampaignDialog({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "reactivation",
    channel: "sms",
    status: "draft",
    target_count: 0,
    start_date: "",
    end_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.start_date) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await base44.functions.invoke("awsClaims", {
        action: "createCampaign",
        campaign: formData,
      });
      setFormData({
        name: "",
        type: "reactivation",
        channel: "sms",
        status: "draft",
        target_count: 0,
        start_date: "",
        end_date: "",
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Create Campaign</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Campaign Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Q4 Patient Reactivation"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full mt-1 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm"
            >
              <option value="reactivation">Reactivation</option>
              <option value="retention">Retention</option>
              <option value="referral">Referral</option>
              <option value="seasonal">Seasonal</option>
              <option value="wellness">Wellness</option>
              <option value="review_request">Review Request</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Channel</label>
            <select
              value={formData.channel}
              onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
              className="w-full mt-1 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm"
            >
              <option value="sms">SMS</option>
              <option value="email">Email</option>
              <option value="voice">Voice</option>
              <option value="multi">Multi-channel</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Target Count</label>
            <Input
              type="number"
              value={formData.target_count}
              onChange={(e) => setFormData({ ...formData, target_count: parseInt(e.target.value) || 0 })}
              placeholder="Number of targets"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Start Date *</label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">End Date</label>
            <Input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="mt-1"
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-md p-2">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}