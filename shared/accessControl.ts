export type AccountRole = "user" | "admin";

export function canAccessAdmin(role: AccountRole | null | undefined) {
  return role === "admin";
}

export function postLoginDestination(role: AccountRole) {
  return canAccessAdmin(role) ? "/admin" : "/conta";
}

export function safePostLoginDestination(role: AccountRole, requestedPath?: string | null) {
  if (requestedPath?.startsWith("/admin") && !canAccessAdmin(role)) return "/conta";
  if (requestedPath?.startsWith("/") && !requestedPath.startsWith("//")) return requestedPath;
  return postLoginDestination(role);
}
