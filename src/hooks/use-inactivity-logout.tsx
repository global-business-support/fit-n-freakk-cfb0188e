import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

const ACTIVITY_EVENTS = ["mousedown", "keydown", "touchstart", "scroll", "mousemove"];

/**
 * Auto-logs out the user after N minutes of inactivity.
 * Reads `auto_logout_enabled` and `auto_logout_minutes` from app_settings.
 * Admins are exempt.
 */
export function useInactivityLogout() {
  const { user, role, signOut } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enabledRef = useRef(false);
  const minutesRef = useRef(2);

  useEffect(() => {
    if (!user || role === "admin") return;

    let cancelled = false;

    const loadSettings = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("key,value")
        .in("key", ["auto_logout_enabled", "auto_logout_minutes"]);
      if (cancelled) return;
      const map = Object.fromEntries((data ?? []).map((r: any) => [r.key, r.value]));
      enabledRef.current = map.auto_logout_enabled === "true";
      const m = Number(map.auto_logout_minutes);
      minutesRef.current = Number.isFinite(m) && m > 0 ? m : 2;
      armTimer();
    };

    const armTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (!enabledRef.current) return;
      timerRef.current = setTimeout(() => {
        signOut();
      }, minutesRef.current * 60 * 1000);
    };

    const onActivity = () => armTimer();

    loadSettings();

    const channel = supabase
      .channel("auto_logout_settings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings" },
        () => loadSettings(),
      )
      .subscribe();

    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
      supabase.removeChannel(channel);
    };
  }, [user, role, signOut]);
}
