import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, CheckCircle2, Loader2 } from "lucide-react";

export default function IntegrationConnectDialog({ open, integration, onClose, onConnect }) {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      onConnect?.(integration);
      setTimeout(() => {
        setConnected(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Connect {integration}</h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        
        {!connected ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              You'll be securely authenticated with {integration}. Your credentials are encrypted and never stored unencrypted.
            </p>
            <div className="bg-muted/30 p-3 rounded-lg mb-6 text-xs text-muted-foreground">
              <p className="font-medium mb-1">What we access:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>Read-only access to your data</li>
                <li>Automated sync capabilities</li>
                <li>No credentials stored</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
              <Button onClick={handleConnect} disabled={connecting} className="flex-1 gap-2">
                {connecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  `Connect ${integration}`
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex justify-center mb-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </motion.div>
            <p className="font-semibold text-emerald-700 mb-1">Connected successfully!</p>
            <p className="text-sm text-muted-foreground">Integration is now active and syncing data.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}