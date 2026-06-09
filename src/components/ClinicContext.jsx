import { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const ClinicContext = createContext();

export function ClinicProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [clinic, setClinic] = useState(null);
  const [clinicId, setClinicId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadClinic = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await base44.auth.me();
      if (user?.clinic_id) {
        setClinicId(user.clinic_id);
        try {
          const clinicData = await base44.entities.Clinic.filter({ id: user.clinic_id });
          if (clinicData.length > 0) {
            setClinic(clinicData[0]);
          }
        } catch (e) {
          console.error("Failed to load clinic entity:", e);
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
    // Only load clinic data after authentication is confirmed
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
  if (!context) {
    throw new Error("useClinic must be used within ClinicProvider");
  }
  return context;
}
