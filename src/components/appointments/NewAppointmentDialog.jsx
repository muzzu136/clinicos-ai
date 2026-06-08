import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { X, Loader2 } from "lucide-react";

export default function NewAppointmentDialog({ open, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    patient_name: "",
    provider_name: "",
    appointment_date: "",
    duration_minutes: 30,
    type: "follow_up",
    status: "scheduled",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient_name || !formData.provider_name || !formData.appointment_date) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await base44.functions.invoke("awsAppointments", {
        action: "create",
        appointment: formData,
      });
      setFormData({
        patient_name: "",
        provider_name: "",
        appointment_date: "",
        duration_minutes: 30,
        type: "follow_up",
        status: "scheduled",
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
          <h2 className="text-lg font-semibold">New Appointment</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Patient Name *</label>
            <Input
              value={formData.patient_name}
              onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
              placeholder="Enter patient name"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Provider Name *</label>
            <Input
              value={formData.provider_name}
              onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
              placeholder="Enter provider name"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Date & Time *</label>
            <Input
              type="datetime-local"
              value={formData.appointment_date}
              onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Duration (minutes)</label>
            <Input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
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
              <option value="new_patient">New Patient</option>
              <option value="follow_up">Follow-up</option>
              <option value="wellness">Wellness</option>
              <option value="urgent">Urgent</option>
              <option value="telehealth">Telehealth</option>
              <option value="procedure">Procedure</option>
            </select>
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