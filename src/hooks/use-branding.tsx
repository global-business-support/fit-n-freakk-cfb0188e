import { useEffect, useState, createContext, useContext, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Branding {
  appName: string;
  logoUrl: string;
  refresh: () => Promise<void>;
}

const BrandingContext = createContext<Branding | null>(null);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [appName, setAppName] = useState("Feet & Freakk");
  const [logoUrl, setLogoUrl] = useState("");

  const refresh = async () => {
    const { data } = await supabase.from("app_settings").select("key,value");
    if (data) {
      const map = Object.fromEntries(data.map((r: any) => [r.key, r.value]));
      if (map.app_name) setAppName(map.app_name);
      if (map.logo_url !== undefined) setLogoUrl(map.logo_url || "");
    }
  };

  useEffect(() => {
    refresh();
    const channel = supabase
      .channel("app_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings" },
        () => refresh()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <BrandingContext.Provider value={{ appName, logoUrl, refresh }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) {
    // Fallback to defaults if provider missing
    return { appName: "Feet & Freakk", logoUrl: "", refresh: async () => {} };
  }
  return ctx;
}
