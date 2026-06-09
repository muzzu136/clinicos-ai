import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const specialties = ["Family Medicine", "Internal Medicine", "Pediatrics", "Cardiology", "Orthopedics", "Urgent Care", "Mental Health"];

export default function AddProviderDialog({ open, onClose, clinicId, onSuccess }) {
  const [formData, setFormData] = useState({ name: "", specialty: "", npi: "", email: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.specialty) return;
    setLoading(true);
    try {
      await base44.entities.Provider.create({
        clinic_id: clinicId,
        name: formData.name,
        specialty: formData.specialty,
        npi: formData.npi || "",
        email: formData.email || "",
        status: "active",
        daily_capacity: 20
      });
      setFormData({ name: "", specialty: "", npi: "", email: "" });
      onSuccess?.();
      onClose();
    } catch (e) {
      console.error("Failed to create provider:", e);
      toast.error(e.message || "Failed to add provider. Please try again.");
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add Provider</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Provider Name</label>
            <Input placeholder="Dr. Jane Smith" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Specialty</label>
            <select value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3">
              <option value="">Select specialty</option>
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">NPI (Optional)</label>
            <Input placeholder="National Provider ID" value={formData.npi} onChange={e => setFormData({...formData, npi: e.target.value})} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Email (Optional)</label>
            <Input type="email" placeholder="email@clinic.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">{loading ? "Adding..." : "Add Provider"}</Button>
        </div>
      </motion.div>
    </div>
  );
}