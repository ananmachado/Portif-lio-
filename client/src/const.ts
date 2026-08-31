export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Legacy Manus OAuth entry point kept only for source compatibility.
 * Production authentication now uses /admin-login -> /api/auth/login.
 * No VITE_* authentication values are read by the browser.
 */
export const startLogin = (returnTo?: string) => {
  if (typeof window === "undefined") return;

  const destination =
    returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
      ? `/admin-login?returnTo=${encodeURIComponent(returnTo)}`
      : "/admin-login";

  window.location.href = destination;
};
