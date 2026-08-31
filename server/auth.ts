import type { Express, Request, Response } from "express";
import { parse as parseCookieHeader } from "cookie";
import {
  assertSupabaseAuthConfig,
  ENV,
} from "./_core/env";
import { getUserByOpenId, upsertUser } from "./db";
import type { User } from "../drizzle/schema";

const ACCESS_COOKIE = "portfolio-sb-access";
const REFRESH_COOKIE = "portfolio-sb-refresh";
const ACCESS_FALLBACK_MAX_AGE_MS = 60 * 60 * 1000;
const REFRESH_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

type SupabaseAuthUser = {
  id?: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

type SupabaseSessionResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: SupabaseAuthUser;
  message?: string;
  msg?: string;
  error?: string;
  error_description?: string;
  [key: string]: unknown;
};

function authConfig() {
  assertSupabaseAuthConfig();

  return {
    baseUrl: ENV.supabaseUrl.replace(/\/+$/, ""),
    apiKey: ENV.supabasePublishableKey,
  };
}

function cookieOptions(req: Request) {
  const forwardedProto = String(req.headers["x-forwarded-proto"] ?? "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  const secure = req.secure || forwardedProto === "https" || ENV.isProduction;

  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
  };
}

function disableCaching(res: Response) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

function readCookies(req: Request) {
  return parseCookieHeader(req.headers.cookie ?? "");
}

function setSessionCookies(
  req: Request,
  res: Response,
  session: SupabaseSessionResponse,
) {
  const base = cookieOptions(req);

  if (session.access_token) {
    const expiresIn = Number(session.expires_in);
    const maxAge =
      Number.isFinite(expiresIn) && expiresIn > 0
        ? expiresIn * 1000
        : ACCESS_FALLBACK_MAX_AGE_MS;

    res.cookie(ACCESS_COOKIE, session.access_token, { ...base, maxAge });
  }

  if (session.refresh_token) {
    res.cookie(REFRESH_COOKIE, session.refresh_token, {
      ...base,
      maxAge: REFRESH_MAX_AGE_MS,
    });
  }

  disableCaching(res);
}

export function clearPortfolioSessionCookies(req: Request, res: Response) {
  const base = cookieOptions(req);
  res.clearCookie(ACCESS_COOKIE, base);
  res.clearCookie(REFRESH_COOKIE, base);
  disableCaching(res);
}

async function supabaseAuth(
  path: string,
  body: unknown,
): Promise<SupabaseSessionResponse> {
  const { baseUrl, apiKey } = authConfig();
  const response = await fetch(`${baseUrl}/auth/v1${path}`, {
    method: "POST",
    headers: {
      apikey: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let data: SupabaseSessionResponse = {};

  try {
    data = text ? (JSON.parse(text) as SupabaseSessionResponse) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    const message =
      data.msg ||
      data.message ||
      data.error_description ||
      data.error ||
      "Não foi possível autenticar.";
    const error = new Error(String(message));
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return data;
}

async function fetchSupabaseUser(accessToken: string) {
  const { baseUrl, apiKey } = authConfig();
  const response = await fetch(`${baseUrl}/auth/v1/user`, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) return null;
  return (await response.json()) as SupabaseAuthUser;
}

export async function syncPortfolioUser(
  authUser: SupabaseAuthUser | null | undefined,
): Promise<User | null> {
  if (!authUser?.id) return null;

  const email = String(authUser.email ?? "").trim().toLowerCase() || null;
  const metadataName = authUser.user_metadata?.name;
  const name =
    (typeof metadataName === "string" && metadataName.trim()) ||
    email?.split("@")[0] ||
    "Usuário";

  const isOwner = Boolean(ENV.ownerEmail && email === ENV.ownerEmail);

  await upsertUser({
    openId: authUser.id,
    name,
    email,
    loginMethod: "supabase",
    ...(isOwner ? { role: "admin" as const } : {}),
    lastSignedIn: new Date(),
  });

  return (await getUserByOpenId(authUser.id)) ?? null;
}

async function refreshSession(req: Request, res: Response) {
  const refreshToken = readCookies(req)[REFRESH_COOKIE];
  if (!refreshToken) return null;

  try {
    const data = await supabaseAuth("/token?grant_type=refresh_token", {
      refresh_token: refreshToken,
    });

    if (!data.access_token) return null;
    setSessionCookies(req, res, data);
    return data;
  } catch {
    clearPortfolioSessionCookies(req, res);
    return null;
  }
}

/**
 * Resolve a signed-in portfolio user from server-managed HTTP-only cookies.
 * The browser never receives a Supabase API key and never stores Supabase
 * access/refresh tokens in localStorage or sessionStorage.
 */
export async function resolveAuthenticatedPortfolioUser(
  req: Request,
  res: Response,
): Promise<User | null> {
  const cookies = readCookies(req);
  let accessToken = cookies[ACCESS_COOKIE];
  let authUser = accessToken ? await fetchSupabaseUser(accessToken) : null;

  if (!authUser) {
    const refreshed = await refreshSession(req, res);
    accessToken = refreshed?.access_token;
    authUser =
      refreshed?.user ??
      (accessToken ? await fetchSupabaseUser(accessToken) : null);
  }

  if (!authUser?.id) return null;
  return syncPortfolioUser(authUser);
}

export function registerSupabaseAuthRoutes(app: Express) {
  app.post("/api/auth/refresh", async (req, res) => {
    disableCaching(res);
    const data = await refreshSession(req, res);

    if (!data) {
      return res.status(401).json({ message: "Sessão expirada." });
    }

    return res.json({ success: true });
  });

  app.post("/api/auth/logout", async (req, res) => {
    disableCaching(res);
    const token = readCookies(req)[ACCESS_COOKIE];

    try {
      if (token) {
        const { baseUrl, apiKey } = authConfig();
        await fetch(`${baseUrl}/auth/v1/logout`, {
          method: "POST",
          headers: {
            apikey: apiKey,
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch {
      // Always clear our cookies even if Supabase is temporarily unavailable.
    }

    clearPortfolioSessionCookies(req, res);
    return res.json({ success: true });
  });

  app.post("/api/auth/login", async (req, res) => {
    disableCaching(res);

    try {
      const email = String(req.body?.email ?? "").trim().toLowerCase();
      const password = String(req.body?.password ?? "");

      if (!email || !password) {
        return res.status(400).json({ message: "Informe e-mail e senha." });
      }

      const data = await supabaseAuth("/token?grant_type=password", {
        email,
        password,
      });
      const portfolioUser = await syncPortfolioUser(data.user);

      if (!portfolioUser) {
        return res.status(401).json({
          message:
            "A conta foi autenticada, mas não pôde ser vinculada ao portfólio.",
        });
      }

      if (portfolioUser.role !== "admin") {
        clearPortfolioSessionCookies(req, res);
        return res.status(403).json({
          message:
            "Esta conta existe no Supabase, mas não possui permissão de administrador. Confira OWNER_EMAIL na Vercel ou role = admin em public.users.",
        });
      }

      if (!data.access_token || !data.refresh_token) {
        return res.status(401).json({
          message: "O Supabase não retornou uma sessão válida para esta conta.",
        });
      }

      setSessionCookies(req, res, data);
      return res.json({
        success: true,
        portfolioUser,
      });
    } catch (error) {
      const status = (error as Error & { status?: number })?.status || 500;
      return res.status(status).json({
        message:
          error instanceof Error ? error.message : "Não foi possível entrar.",
      });
    }
  });
}
