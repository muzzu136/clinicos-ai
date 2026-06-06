import { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const ClinicContext = createContext();

export function ClinicProvider({ children }) {
  const [clinic, setClinic] = useState(null);
  const [clinicId, setClinicId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClinic = async () => {
      try {
        const user = await base44.auth.me();
        if (user?.clinic_id) {
          setClinicId(user.clinic_id);
          const clinicData = await base44.entities.Clinic.filter({ id: user.clinic_id });
          if (clinicData.length > 0) {
            setClinic(clinicData[0]);
          }
        }
      } catch (e) {
        console.error("Failed to load clinic:", e);
      } finally {
        setLoading(false);
      }
    };
    loadClinic();
  }, []);

  return (
    <ClinicContext.Provider value={{ clinic, clinicId, loading }}>
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