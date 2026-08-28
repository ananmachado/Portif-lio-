export type PortfolioAuthUser = {
  id?: number;
  openId?: string;
  email?: string | null;
  name?: string | null;
  role?: "user" | "admin";
};

type AuthResponse = {
  success?: boolean;
  message?: string;
  portfolioUser?: PortfolioAuthUser | null;
  user?: {
    id?: string;
    email?: string;
  } | null;
};

async function apiAuth(path: string, body?: unknown): Promise<AuthResponse> {
  const response = await fetch(`/api/auth${path}`, {
    method: "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    credentials: "include",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let data: AuthResponse = {};

  try {
    data = text ? (JSON.parse(text) as AuthResponse) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(data.message || "Não foi possível autenticar.");
  }

  return data;
}

/**
 * Browser code sends only e-mail/password to our own Vercel API.
 * Supabase keys and session tokens remain server-side in HTTP-only cookies.
 */
export function signIn(email: string, password: string) {
  return apiAuth("/login", { email, password });
}

export function signUp(email: string, password: string, name: string) {
  return apiAuth("/signup", { email, password, name });
}

export function signOut() {
  return apiAuth("/logout");
}
