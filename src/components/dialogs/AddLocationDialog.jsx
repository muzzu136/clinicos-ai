import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export default function AddLocationDialog({ open, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const handleSubmit = () => {
    if (formData.name && formData.address && formData.city) {
      onAdd?.(formData);
      setFormData({ name: "", address: "", city: "", state: "", zip: "" });
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Add New Location</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Clinic Name</label>
            <Input placeholder="e.g., Westside Medical" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Address</label>
            <Input placeholder="Street address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="mt-1" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">City</label>
              <Input placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">State</label>
              <Input placeholder="IL" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value.toUpperCase()})} className="mt-1" maxLength="2" />
            </div>
            <div>
              <label className="text-sm font-medium">ZIP</label>
              <Input placeholder="60601" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} className="mt-1" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} className="flex-1">Add Location</Button>
        </div>
      </motion.div>
    </div>
  );
}