import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function ClinicOnboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await base44.auth.me();
      const clinic = await base44.entities.Clinic.create({
        ...formData,
        admin_id: user.id,
        subscription_status: "trial",
        trial_ends: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      // Update user with clinic_id
      await base44.auth.updateMe({ clinic_id: clinic.id });
      window.location.href = "/customer/dashboard";
    } catch (e) {
      console.error("Onboarding error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-heading font-bold mb-2">Welcome to ClinicOS AI</h1>
        <p className="text-muted-foreground mb-6">Set up your clinic to get started</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Clinic Name</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Downtown Medical Center"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="clinic@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Phone</label>
            <Input
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Address</label>
            <Input
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">City</label>
              <Input
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Chicago"
              />
            </div>
            <div>
              <label className="text-sm font-medium">State</label>
              <Input
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="IL"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">ZIP</label>
            <Input
              required
              value={formData.zip}
              onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              placeholder="60601"
            />
          </div>

          <Button disabled={loading} className="w-full" type="submit">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Complete Setup
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          You'll get 14 days free trial. No credit card required.
        </p>
      </Card>
    </div>
  );
}