import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$299",
    period: "/month",
    description: "Perfect for small clinics",
    features: [
      "Up to 500 patients",
      "Basic appointment scheduling",
      "Claims processing",
      "Email support",
      "1 admin user"
    ],
    id: "starter"
  },
  {
    name: "Pro",
    price: "$799",
    period: "/month",
    description: "For growing clinics",
    features: [
      "Up to 2,500 patients",
      "Advanced appointment scheduling",
      "Full revenue cycle management",
      "AI copilot",
      "Priority email & chat support",
      "Up to 5 admin users"
    ],
    id: "pro",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    description: "For large healthcare networks",
    features: [
      "Unlimited patients & locations",
      "Custom integrations",
      "Dedicated account manager",
      "Phone support",
      "Voice receptionist included",
      "SLA guarantees"
    ],
    id: "enterprise"
  }
];

export default function SubscriptionPlans() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (planId) => {
    if (planId === "enterprise") {
      window.location.href = "mailto:sales@clinicos.ai";
      return;
    }

    setLoading(true);
    try {
      const res = await base44.functions.invoke("createCheckoutSession", { plan: planId });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (e) {
      console.error("Subscription error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold mb-2">Simple, Transparent Pricing</h1>
          <p className="text-lg text-muted-foreground">Choose the perfect plan for your clinic</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.id} className={`flex flex-col p-6 relative ${plan.popular ? "border-primary border-2 shadow-lg" : ""}`}>
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm ml-2">{plan.period}</span>
              </div>

              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading}
                className="w-full mb-6"
                variant={plan.popular ? "default" : "outline"}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {plan.id === "enterprise" ? "Contact Sales" : "Subscribe Now"}
              </Button>

              <ul className="space-y-3 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-card rounded-2xl border border-border p-8">
          <h2 className="text-2xl font-bold mb-6">All Plans Include</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "24/7 API access",
              "HIPAA compliant",
              "Daily backups",
              "Real-time reporting",
              "Mobile app access",
              "Automated claims"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}