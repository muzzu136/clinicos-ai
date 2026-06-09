import { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const ClinicContext = createContext();

export function ClinicProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [clinic, setClinic] = useState(null);
  const [clinicId, setClinicId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadClinic = async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await base44.auth.me();
      if (me?.clinic_id) {
        setClinicId(me.clinic_id);
        try {
          const clinicData = await base44.entities.Clinic.filter({ id: me.clinic_id });
          if (clinicData.length > 0) setClinic(clinicData[0]);
        } catch (e) {
          console.error("Failed to load clinic entity:", e);
        }
      } else if (me?.id) {
        // User exists but has no clinic_id yet — try finding by admin_id
        try {
          const clinics = await base44.entities.Clinic.filter({ admin_id: me.id });
          if (clinics.length > 0) {
            setClinic(clinics[0]);
            setClinicId(clinics[0].id);
          }
        } catch (e) {
          console.error("No clinic found for user:", e);
        }
      }
    } catch (e) {
      console.error("Failed to load clinic:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadClinic();
  }, [isAuthenticated]);

  return (
    <ClinicContext.Provider value={{ clinic, clinicId, loading, error, reload: loadClinic }}>
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) throw new Error("useClinic must be used within ClinicProvider");
  return context;
}
