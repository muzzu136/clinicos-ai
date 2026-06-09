import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AddLeadDialog({ open, onClose, clinicId, onSuccess }) {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", source: "website", service: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) return;
    setLoading(true);
    try {
      await base44.entities.Lead.create({
        clinic_id: clinicId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        source: formData.source,
        service_interest: formData.service,
        status: "new",
        score: Math.floor(Math.random() * 40) + 60
      });
      setFormData({ name: "", email: "", phone: "", source: "website", service: "" });
      onSuccess?.();
      onClose();
    } catch (e) {
      console.error("Failed to create lead:", e);
      toast.error(e.message || "Failed to add lead. Please try again.");
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add New Lead</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Name</label>
            <Input placeholder="Full name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input type="email" placeholder="email@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <Input placeholder="(555) 123-4567" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Service Interest</label>
            <Input placeholder="e.g., Annual Physical" value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} className="mt-1" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">{loading ? "Creating..." : "Add Lead"}</Button>
        </div>
      </motion.div>
    </div>
  );
}