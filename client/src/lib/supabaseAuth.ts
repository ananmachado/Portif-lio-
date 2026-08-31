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
};

async function apiAuth(path: string, body?: unknown): Promise<AuthResponse> {
  const response = await fetch(`/api/auth${path}`, {
    method: "POST",
    headers:
      body === undefined ? undefined : { "Content-Type": "application/json" },
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
 * The browser talks only to our own Vercel API.
 * No Supabase key or Supabase access/refresh token is exposed to client code.
 */
export function signIn(email: string, password: string) {
  return apiAuth("/login", { email, password });
}

export function signOut() {
  return apiAuth("/logout");
}
