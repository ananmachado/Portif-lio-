import type { AccountRole } from "./accessControl";

export function showAdminLoginShortcut(role: AccountRole | null | undefined) {
  return role !== "admin";
}

export function adminShortcutHref(role: AccountRole | null | undefined) {
  return role === "admin" ? "/admin" : "/admin-login";
}
