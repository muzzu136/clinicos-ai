import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

const defaultForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  insurance_provider: "",
  insurance_id: "",
  status: "active",
};

export default function AddPatientDialog({ open, onOpenChange, clinicId, onPatientAdded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(defaultForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setError("First name and last name are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("awsPatients", {
        action: "create",
        clinic_id: clinicId,
        data: formData,
      });
      // Build optimistic patient record for instant display
      const createdPatient = res?.data || {
        ...formData,
        name: `${formData.first_name} ${formData.last_name}`.trim(),
        id: `temp_${Date.now()}`,
        status: formData.status || "active",
        churn_risk_score: 0,
        total_revenue: 0,
      };
      setFormData(defaultForm);
      onOpenChange(false);
      onPatientAdded?.(createdPatient);
    } catch (err) {
      setError(err.message || "Failed to add patient. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!loading) { setError(""); onOpenChange(val); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name" className="text-xs">First Name *</Label>
              <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="last_name" className="text-xs">Last Name *</Label>
              <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-xs">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="phone" className="text-xs">Phone</Label>
            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="date_of_birth" className="text-xs">Date of Birth</Label>
            <Input id="date_of_birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="insurance_provider" className="text-xs">Insurance Provider</Label>
            <Input id="insurance_provider" name="insurance_provider" value={formData.insurance_provider} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="insurance_id" className="text-xs">Insurance ID</Label>
            <Input id="insurance_id" name="insurance_id" value={formData.insurance_id} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="status" className="text-xs">Status</Label>
            <Select value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="churning">At Risk</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-md p-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => { setError(""); onOpenChange(false); }} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Patient
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
