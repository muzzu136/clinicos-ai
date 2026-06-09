import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, CheckCircle2, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useClinic } from "@/components/ClinicContext";
import { toast } from "sonner";

// Per-integration credential fields
const INTEGRATION_FIELDS = {
  "Tebra (Kareo)": [
    { key: "api_key", label: "API Key", type: "password", placeholder: "Your Tebra API Key" },
    { key: "practice_id", label: "Practice ID", type: "text", placeholder: "e.g. 12345" },
  ],
  "DrChrono": [
    { key: "client_id", label: "Client ID", type: "text", placeholder: "DrChrono OAuth Client ID" },
    { key: "client_secret", label: "Client Secret", type: "password", placeholder: "DrChrono OAuth Client Secret" },
  ],
  "Athenahealth": [
    { key: "client_id", label: "Client ID", type: "text", placeholder: "Athena Client ID" },
    { key: "client_secret", label: "Client Secret", type: "password", placeholder: "Athena Client Secret" },
    { key: "practice_id", label: "Practice ID", type: "text", placeholder: "e.g. 195900" },
  ],
  "AdvancedMD": [
    { key: "username", label: "Username", type: "text", placeholder: "AdvancedMD Username" },
    { key: "password", label: "Password", type: "password", placeholder: "AdvancedMD Password" },
    { key: "office_key", label: "Office Key", type: "text", placeholder: "e.g. ABC123" },
  ],
  "NextGen Healthcare": [
    { key: "api_key", label: "API Key", type: "password", placeholder: "NextGen API Key" },
    { key: "site_id", label: "Site ID", type: "text", placeholder: "Your Site ID" },
  ],
  "eClinicalWorks": [
    { key: "api_key", label: "API Key", type: "password", placeholder: "eCW API Key" },
    { key: "base_url", label: "Base URL", type: "text", placeholder: "https://yourpractice.eclinicalweb.com" },
  ],
  "Twilio SMS": [
    { key: "account_sid", label: "Account SID", type: "text", placeholder: "ACxxxxxxxxxxxxxxxx" },
    { key: "auth_token", label: "Auth Token", type: "password", placeholder: "Your Twilio Auth Token" },
    { key: "phone_number", label: "Phone Number", type: "text", placeholder: "+15551234567" },
  ],
  "RingCentral": [
    { key: "client_id", label: "Client ID", type: "text", placeholder: "RingCentral App Client ID" },
    { key: "client_secret", label: "Client Secret", type: "password", placeholder: "RingCentral App Client Secret" },
    { key: "account_id", label: "Account ID", type: "text", placeholder: "~" },
  ],
  "Zoom": [
    { key: "account_id", label: "Account ID", type: "text", placeholder: "Zoom Account ID" },
    { key: "client_id", label: "Client ID", type: "text", placeholder: "Zoom OAuth Client ID" },
    { key: "client_secret", label: "Client Secret", type: "password", placeholder: "Zoom OAuth Client Secret" },
  ],
  "Stripe": [
    { key: "secret_key", label: "Secret Key", type: "password", placeholder: "sk_live_..." },
    { key: "publishable_key", label: "Publishable Key", type: "text", placeholder: "pk_live_..." },
  ],
  "Square": [
    { key: "access_token", label: "Access Token", type: "password", placeholder: "Square Access Token" },
    { key: "location_id", label: "Location ID", type: "text", placeholder: "Square Location ID" },
  ],
  "Authorize.net": [
    { key: "api_login_id", label: "API Login ID", type: "text", placeholder: "Your API Login ID" },
    { key: "transaction_key", label: "Transaction Key", type: "password", placeholder: "Your Transaction Key" },
  ],
  "Availity": [
    { key: "username", label: "Username", type: "text", placeholder: "Availity Username" },
    { key: "password", label: "Password", type: "password", placeholder: "Availity Password" },
    { key: "payer_id", label: "Default Payer ID", type: "text", placeholder: "e.g. 00001" },
  ],
  "Waystar": [
    { key: "username", label: "Username", type: "text", placeholder: "Waystar Username" },
    { key: "password", label: "Password", type: "password", placeholder: "Waystar Password" },
  ],
  "Change Healthcare": [
    { key: "client_id", label: "Client ID", type: "text", placeholder: "Change Healthcare Client ID" },
    { key: "client_secret", label: "Client Secret", type: "password", placeholder: "Change Healthcare Client Secret" },
  ],
  "Google Calendar": [
    { key: "oauth_email", label: "Google Workspace Email", type: "text", placeholder: "admin@yourclinic.com" },
    { key: "calendar_id", label: "Calendar ID", type: "text", placeholder: "primary or calendar@group.calendar.google.com" },
  ],
  "Microsoft Outlook": [
    { key: "tenant_id", label: "Tenant ID", type: "text", placeholder: "Azure AD Tenant ID" },
    { key: "client_id", label: "Client ID", type: "text", placeholder: "Azure App Client ID" },
    { key: "client_secret", label: "Client Secret", type: "password", placeholder: "Azure App Client Secret" },
  ],
};

const DEFAULT_FIELDS = [
  { key: "api_key", label: "API Key", type: "password", placeholder: "Enter your API Key" },
];

export default function IntegrationConnectDialog({ open, integration, onClose, onConnect }) {
  const { clinicId } = useClinic();
  const [credentials, setCredentials] = useState({});
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [showFields, setShowFields] = useState({});

  const fields = INTEGRATION_FIELDS[integration] || DEFAULT_FIELDS;

  const handleClose = () => {
    setCredentials({});
    setError("");
    setConnected(false);
    setShowFields({});
    onClose();
  };

  const allFilled = fields.every(f => credentials[f.key]?.trim());

  const handleConnect = async () => {
    if (!allFilled) {
      setError("Please fill in all required fields.");
      return;
    }
    setConnecting(true);
    setError("");
    try {
      await base44.functions.invoke("awsIntegrations", {
        action: "connect",
        clinic_id: clinicId,
        integration_name: integration,
        credentials, // encrypted server-side
      });
      setConnected(true);
      onConnect?.(integration);
      toast.success(`${integration} connected successfully.`);
      setTimeout(() => { setConnected(false); handleClose(); }, 1800);
    } catch (e) {
      setError(e.message || "Connection failed. Please check your credentials and try again.");
    } finally {
      setConnecting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">Connect {integration}</h2>
          <button onClick={handleClose} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {!connected ? (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-xs text-amber-800">
              <p className="font-semibold mb-1">🔒 Your credentials are encrypted in transit and at rest.</p>
              <p>We use AES-256 encryption. Credentials are never logged or stored in plain text.</p>
            </div>

            <div className="space-y-3 mb-5">
              {fields.map((field) => (
                <div key={field.key}>
                  <Label className="text-xs font-medium">{field.label} *</Label>
                  <div className="relative mt-1">
                    <Input
                      type={field.type === "password" && !showFields[field.key] ? "password" : "text"}
                      placeholder={field.placeholder}
                      value={credentials[field.key] || ""}
                      onChange={e => setCredentials(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="pr-9"
                    />
                    {field.type === "password" && (
                      <button
                        type="button"
                        onClick={() => setShowFields(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showFields[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">Cancel</Button>
              <Button onClick={handleConnect} disabled={connecting || !allFilled} className="flex-1 gap-2">
                {connecting ? <><Loader2 className="w-4 h-4 animate-spin" />Connecting...</> : `Connect ${integration}`}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex justify-center mb-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </motion.div>
            <p className="font-semibold text-emerald-700 mb-1">Connected successfully!</p>
            <p className="text-sm text-muted-foreground">{integration} is now active and syncing data.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
