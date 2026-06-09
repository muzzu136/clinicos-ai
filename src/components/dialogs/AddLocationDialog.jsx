import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";
import { toast } from "sonner";

const defaultForm = { name: "", address: "", city: "", state: "", zip: "", phone: "", manager: "" };

export default function AddLocationDialog({ open, onClose, onAdd }) {
  const { clinicId } = useClinic();
  const [formData, setFormData] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!formData.name || !formData.address || !formData.city) {
      setError("Name, address, and city are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await base44.entities.Location.create({
        ...formData,
        clinic_id: clinicId,
        status: "active",
      });
      toast.success(`Location "${formData.name}" added successfully.`);
      onAdd?.(res);
      setFormData(defaultForm);
      onClose();
    } catch (e) {
      setError(e.message || "Failed to add location. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !loading) { setError(""); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Add New Location</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs">Location Name *</Label>
            <Input placeholder="e.g., Westside Medical" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="mt-1" /></div>
          <div><Label className="text-xs">Street Address *</Label>
            <Input placeholder="Street address" value={formData.address} onChange={e => setFormData(p => ({...p, address: e.target.value}))} className="mt-1" /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-xs">City *</Label>
              <Input placeholder="City" value={formData.city} onChange={e => setFormData(p => ({...p, city: e.target.value}))} className="mt-1" /></div>
            <div><Label className="text-xs">State</Label>
              <Input placeholder="IL" value={formData.state} onChange={e => setFormData(p => ({...p, state: e.target.value.toUpperCase()}))} className="mt-1" maxLength="2" /></div>
            <div><Label className="text-xs">ZIP</Label>
              <Input placeholder="60601" value={formData.zip} onChange={e => setFormData(p => ({...p, zip: e.target.value}))} className="mt-1" /></div>
          </div>
          <div><Label className="text-xs">Phone</Label>
            <Input placeholder="(555) 123-4567" value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))} className="mt-1" /></div>
          <div><Label className="text-xs">Location Manager</Label>
            <Input placeholder="Manager name" value={formData.manager} onChange={e => setFormData(p => ({...p, manager: e.target.value}))} className="mt-1" /></div>
          {error && <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded p-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
        </div>
        <div className="flex gap-3 mt-2">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} className="flex-1 gap-2" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}Add Location
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
