import { supabase } from "@/integrations/supabase/client";

export const DEFAULT_CLOSE_PIN = "1234";

/** Current close PIN stored in app_settings (public read). */
export async function getClosePin(): Promise<string> {
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "close_pin")
    .maybeSingle();
  const v = (data as { value?: string } | null)?.value;
  return v && v.trim() ? v.trim() : DEFAULT_CLOSE_PIN;
}

export async function verifyClosePin(pin: string): Promise<boolean> {
  const expected = await getClosePin();
  return pin.trim() !== "" && pin.trim() === expected;
}

/**
 * Close the app.
 * - Inside the Android (Capacitor) app: exits the app for real.
 * - In a browser: tries window.close(); returns false when the browser
 *   refuses (tabs not opened by script cannot be closed).
 */
export async function requestCloseApp(): Promise<boolean> {
  try {
    const mod = await import("@capacitor/app");
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    if (cap?.isNativePlatform?.()) {
      await mod.App.exitApp();
      return true;
    }
  } catch {
    // web build without native runtime — fall through
  }
  try {
    window.close();
    await new Promise((r) => setTimeout(r, 300));
    return !!window.closed;
  } catch {
    return false;
  }
}
