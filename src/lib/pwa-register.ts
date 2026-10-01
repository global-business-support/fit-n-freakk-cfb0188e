// Single guarded service-worker registrar. Never registers in dev / preview / iframe.
async function unregisterAppSW() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    regs
      .filter((r) => (r.active || r.installing || r.waiting)?.scriptURL.endsWith("/sw.js"))
      .map((r) => r.unregister()),
  );
}

function refused() {
  if (!import.meta.env.PROD) return true;
  try { if (window.self !== window.top) return true; } catch { return true; }
  const h = window.location.hostname;
  if (h.startsWith("id-preview--") || h.startsWith("preview--")) return true;
  const hosts = ["lovableproject.com", "lovableproject-dev.com", "beta.lovable.dev"];
  if (hosts.some((d) => h === d || h.endsWith("." + d))) return true;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

export async function registerPWA() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (refused()) { await unregisterAppSW(); return; }
  try { await navigator.serviceWorker.register("/sw.js", { scope: "/" }); } catch { /* ignore */ }
}
