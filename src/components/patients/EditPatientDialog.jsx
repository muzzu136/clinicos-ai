import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function EditPatientDialog({ open, onOpenChange, patient, clinicId, onPatientUpdated }) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState(patient || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.functions.invoke("awsPatients", {
        action: "update",
        clinic_id: clinicId,
        id: patient.id,
        data: formData,
      });
      onOpenChange(false);
      onPatientUpdated?.();
    } catch (error) {
      console.error("Error updating patient:", error);
      toast.error(error.message || "Failed to update patient.");
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this patient?")) return;
    setDeleting(true);
    try {
      await base44.functions.invoke("awsPatients", {
        action: "delete",
        clinic_id: clinicId,
        id: patient.id,
      });
      onOpenChange(false);
      onPatientUpdated?.();
    } catch (error) {
      console.error("Error deleting patient:", error);
      toast.error(error.message || "Failed to delete patient.");
    }
    setDeleting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Patient</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name" className="text-xs">First Name</Label>
              <Input id="first_name" name="first_name" value={formData.first_name || ""} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="last_name" className="text-xs">Last Name</Label>
              <Input id="last_name" name="last_name" value={formData.last_name || ""} onChange={handleChange} required />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-xs">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email || ""} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="phone" className="text-xs">Phone</Label>
            <Input id="phone" name="phone" value={formData.phone || ""} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="date_of_birth" className="text-xs">Date of Birth</Label>
            <Input id="date_of_birth" name="date_of_birth" type="date" value={formData.date_of_birth || ""} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="insurance_provider" className="text-xs">Insurance Provider</Label>
            <Input id="insurance_provider" name="insurance_provider" value={formData.insurance_provider || ""} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="insurance_id" className="text-xs">Insurance ID</Label>
            <Input id="insurance_id" name="insurance_id" value={formData.insurance_id || ""} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="status" className="text-xs">Status</Label>
            <Select value={formData.status || "active"} onValueChange={handleStatusChange}>
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

          <div className="flex gap-2 justify-between pt-4">
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting} className="gap-2">
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}