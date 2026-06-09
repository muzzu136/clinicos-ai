import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertCircle } from "lucide-react";
import { useClinic } from "@/components/ClinicContext";

const defaultForm = {
  patient_name: "",
  provider_name: "",
  appointment_date: "",
  duration_minutes: 30,
  type: "follow_up",
  status: "scheduled",
  notes: "",
};

export default function NewAppointmentDialog({ open, onClose, onSuccess }) {
  const { clinicId } = useClinic();
  const [formData, setFormData] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient_name || !formData.provider_name || !formData.appointment_date) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await base44.functions.invoke("awsAppointments", {
        action: "create",
        clinic_id: clinicId,
        appointment: formData,
      });
      setFormData(defaultForm);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val && !loading) { setError(""); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="patient_name" className="text-sm font-medium">Patient Name *</Label>
            <Input
              id="patient_name"
              name="patient_name"
              value={formData.patient_name}
              onChange={handleChange}
              placeholder="Enter patient name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="provider_name" className="text-sm font-medium">Provider Name *</Label>
            <Input
              id="provider_name"
              name="provider_name"
              value={formData.provider_name}
              onChange={handleChange}
              placeholder="Enter provider name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="appointment_date" className="text-sm font-medium">Date & Time *</Label>
            <Input
              id="appointment_date"
              name="appointment_date"
              type="datetime-local"
              value={formData.appointment_date}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Duration (min)</Label>
              <Input
                name="duration_minutes"
                type="number"
                min="15"
                step="15"
                value={formData.duration_minutes}
                onChange={handleChange}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData(p => ({ ...p, type: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_patient">New Patient</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="wellness">Wellness</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="telehealth">Telehealth</SelectItem>
                  <SelectItem value="procedure">Procedure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
            <Input
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Optional notes"
              className="mt-1"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md p-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => { setError(""); onClose(); }} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Appointment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
