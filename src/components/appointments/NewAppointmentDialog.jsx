import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertCircle, CalendarDays, Clock } from "lucide-react";
import { useClinic } from "@/components/ClinicContext";

// Generate hours 1–12
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
// Generate minutes in 15-min increments
const MINUTES = ["00", "15", "30", "45"];

const defaultForm = {
  patient_name: "",
  provider_name: "",
  date: "",       // YYYY-MM-DD
  hour: "09",
  minute: "00",
  ampm: "AM",
  duration_minutes: 30,
  type: "follow_up",
  status: "scheduled",
  notes: "",
};

// Build ISO string from separate date/time fields
const buildDatetime = ({ date, hour, minute, ampm }) => {
  if (!date || !hour || !minute) return "";
  let h = parseInt(hour, 10);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return `${date}T${String(h).padStart(2, "0")}:${minute}:00`;
};

// Get today's date in YYYY-MM-DD
const today = () => new Date().toISOString().split("T")[0];

export default function NewAppointmentDialog({ open, onClose, onSuccess }) {
  const { clinicId } = useClinic();
  const [formData, setFormData] = useState({ ...defaultForm, date: today() });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient_name.trim()) { setError("Patient name is required."); return; }
    if (!formData.provider_name.trim()) { setError("Provider name is required."); return; }
    if (!formData.date) { setError("Please select a date."); return; }

    const appointment_date = buildDatetime(formData);
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("awsAppointments", {
        action: "create",
        clinic_id: clinicId,
        appointment: {
          patient_name: formData.patient_name,
          provider_name: formData.provider_name,
          appointment_date,
          duration_minutes: formData.duration_minutes,
          type: formData.type,
          status: formData.status,
          notes: formData.notes,
        },
      });
      const created = res?.data || null;
      setFormData({ ...defaultForm, date: today() });
      onSuccess?.(created);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const previewTime = formData.date
    ? `${formData.date} at ${formData.hour}:${formData.minute} ${formData.ampm}`
    : "";

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val && !loading) { setError(""); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Appointment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient & Provider */}
          <div>
            <Label className="text-sm font-medium">Patient Name *</Label>
            <Input className="mt-1" placeholder="Enter patient name"
              value={formData.patient_name} onChange={e => set("patient_name", e.target.value)} />
          </div>
          <div>
            <Label className="text-sm font-medium">Provider Name *</Label>
            <Input className="mt-1" placeholder="Enter provider name"
              value={formData.provider_name} onChange={e => set("provider_name", e.target.value)} />
          </div>

          {/* Date */}
          <div>
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-muted-foreground" /> Date *
            </Label>
            <Input
              className="mt-1"
              type="date"
              value={formData.date}
              min={today()}
              onChange={e => set("date", e.target.value)}
            />
          </div>

          {/* Time row */}
          <div>
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-muted-foreground" /> Time *
            </Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {/* Hour */}
              <Select value={formData.hour} onValueChange={v => set("hour", v)}>
                <SelectTrigger><SelectValue placeholder="Hour" /></SelectTrigger>
                <SelectContent className="max-h-48">
                  {HOURS.map(h => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Minute */}
              <Select value={formData.minute} onValueChange={v => set("minute", v)}>
                <SelectTrigger><SelectValue placeholder="Min" /></SelectTrigger>
                <SelectContent>
                  {MINUTES.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* AM / PM */}
              <Select value={formData.ampm} onValueChange={v => set("ampm", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {previewTime && (
              <p className="text-xs text-muted-foreground mt-1.5">
                📅 {previewTime}
              </p>
            )}
          </div>

          {/* Duration & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Duration</Label>
              <Select
                value={String(formData.duration_minutes)}
                onValueChange={v => set("duration_minutes", parseInt(v))}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[15, 20, 30, 45, 60, 90].map(d => (
                    <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Type</Label>
              <Select value={formData.type} onValueChange={v => set("type", v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
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

          {/* Notes */}
          <div>
            <Label className="text-sm font-medium">Notes</Label>
            <Input className="mt-1" placeholder="Optional notes"
              value={formData.notes} onChange={e => set("notes", e.target.value)} />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md p-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => { setError(""); onClose(); }}
              className="flex-1" disabled={loading}>Cancel</Button>
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
