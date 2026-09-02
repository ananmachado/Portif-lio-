import type { IncomingMessage, ServerResponse } from "node:http";
import { parse as parseCookieHeader, serialize as serializeCookie } from "cookie";
import { ENV, assertSupabaseAuthConfig } from "./_core/env.js";
import { getUserByOpenId, upsertUser } from "./db.js";
import type { User } from "../drizzle/schema";

const ACCESS_COOKIE = "portfolio-sb-access";
const REFRESH_COOKIE = "portfolio-sb-refresh";
const ACCESS_FALLBACK_MAX_AGE_SECONDS = 60 * 60;
const REFRESH_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

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

function disableCaching(res: ServerResponse) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  disableCaching(res);
  res.end(JSON.stringify(body));
}

function isSecureRequest(req: IncomingMessage) {
  const forwardedProto = String(req.headers["x-forwarded-proto"] ?? "")
    .split(",")[0]
    .trim()
    .toLowerCase();
  return forwardedProto === "https" || ENV.isProduction;
}

function sessionCookieHeaders(
  req: IncomingMessage,
  session: SupabaseSessionResponse,
): string[] {
  const secure = isSecureRequest(req);
  const cookies: string[] = [];

  if (session.access_token) {
    const expiresIn = Number(session.expires_in);
    const maxAge =
      Number.isFinite(expiresIn) && expiresIn > 0
        ? Math.floor(expiresIn)
        : ACCESS_FALLBACK_MAX_AGE_SECONDS;

    cookies.push(
      serializeCookie(ACCESS_COOKIE, session.access_token, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge,
      }),
    );
  }

  if (session.refresh_token) {
    cookies.push(
      serializeCookie(REFRESH_COOKIE, session.refresh_token, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: REFRESH_MAX_AGE_SECONDS,
      }),
    );
  }

  return cookies;
}

function clearCookieHeaders(req: IncomingMessage): string[] {
  const secure = isSecureRequest(req);
  return [ACCESS_COOKIE, REFRESH_COOKIE].map((name) =>
    serializeCookie(name, "", {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    }),
  );
}

function authConfig() {
  assertSupabaseAuthConfig();
  return {
    baseUrl: ENV.supabaseUrl.replace(/\/+$/, ""),
    apiKey: ENV.supabasePublishableKey,
  };
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

async function syncPortfolioUser(
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

async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    if (chunks.reduce((sum, item) => sum + item.length, 0) > 1024 * 1024) {
      throw new Error("Corpo da requisição muito grande.");
    }
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    throw new Error("JSON inválido.");
  }
}

function loginError(res: ServerResponse, error: unknown) {
  const rawMessage =
    error instanceof Error ? error.message : "Não foi possível entrar.";
  const explicitStatus = (error as Error & { status?: number })?.status;

  if (explicitStatus) {
    json(res, explicitStatus, { message: rawMessage });
    return;
  }

  const lower = rawMessage.toLowerCase();
  if (lower.includes("supabase_secret_key não está configurada")) {
    json(res, 503, {
      message:
        "O login chegou ao servidor, mas SUPABASE_SECRET_KEY não está configurada na Vercel.",
    });
    return;
  }
  if (lower.includes("users failed (401)")) {
    json(res, 503, {
      message:
        "O Supabase autenticou a conta, mas a Secret/Service Role key da Vercel é inválida para este projeto.",
    });
    return;
  }
  if (lower.includes("users failed (403)")) {
    json(res, 503, {
      message:
        "O Supabase autenticou a conta, mas a chave de servidor não consegue acessar public.users.",
    });
    return;
  }
  if (lower.includes("users failed (404)") || lower.includes("pgrst205")) {
    json(res, 503, {
      message:
        "O Supabase autenticou a conta, mas public.users não foi encontrada pela Data API.",
    });
    return;
  }
  if (
    lower === "fetch failed" ||
    lower.includes("enotfound") ||
    lower.includes("econnrefused")
  ) {
    json(res, 503, {
      message:
        "A função da Vercel não conseguiu alcançar o Supabase. Confira SUPABASE_URL e o status do projeto.",
    });
    return;
  }

  json(res, 500, { message: rawMessage });
}

async function login(req: IncomingMessage, res: ServerResponse) {
  try {
    const body = await readJsonBody(req);
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      json(res, 400, { message: "Informe e-mail e senha." });
      return;
    }

    const data = await supabaseAuth("/token?grant_type=password", {
      email,
      password,
    });

    const portfolioUser = await syncPortfolioUser(data.user);
    if (!portfolioUser) {
      json(res, 401, {
        message:
          "A conta foi autenticada, mas não pôde ser vinculada ao portfólio.",
      });
      return;
    }

    if (portfolioUser.role !== "admin") {
      res.setHeader("Set-Cookie", clearCookieHeaders(req));

      if (!ENV.ownerEmail) {
        json(res, 503, {
          message:
            "Login válido no Supabase, mas OWNER_EMAIL/ADMIN_EMAIL não está configurado na Vercel.",
        });
        return;
      }

      if (email !== ENV.ownerEmail) {
        json(res, 403, {
          message:
            "Login válido no Supabase, mas este e-mail não é o administrador configurado na Vercel.",
        });
        return;
      }

      json(res, 403, {
        message:
          "Login válido, porém a conta não ficou com role admin em public.users.",
      });
      return;
    }

    if (!data.access_token || !data.refresh_token) {
      json(res, 401, {
        message: "O Supabase não retornou uma sessão válida para esta conta.",
      });
      return;
    }

    res.setHeader("Set-Cookie", sessionCookieHeaders(req, data));
    json(res, 200, { success: true, portfolioUser });
  } catch (error) {
    loginError(res, error);
  }
}

async function refresh(req: IncomingMessage, res: ServerResponse) {
  try {
    const cookies = parseCookieHeader(req.headers.cookie ?? "");
    const refreshToken = cookies[REFRESH_COOKIE];
    if (!refreshToken) {
      json(res, 401, { message: "Sessão expirada." });
      return;
    }

    const data = await supabaseAuth("/token?grant_type=refresh_token", {
      refresh_token: refreshToken,
    });

    if (!data.access_token) {
      res.setHeader("Set-Cookie", clearCookieHeaders(req));
      json(res, 401, { message: "Sessão expirada." });
      return;
    }

    res.setHeader("Set-Cookie", sessionCookieHeaders(req, data));
    json(res, 200, { success: true });
  } catch (error) {
    res.setHeader("Set-Cookie", clearCookieHeaders(req));
    loginError(res, error);
  }
}

async function logout(req: IncomingMessage, res: ServerResponse) {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  const token = cookies[ACCESS_COOKIE];

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
    // Local logout must work even if Supabase is temporarily unavailable.
  }

  res.setHeader("Set-Cookie", clearCookieHeaders(req));
  json(res, 200, { success: true });
}

export async function handleDirectAuthRequest(
  path: string,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  if (path === "auth/login" && req.method === "POST") {
    await login(req, res);
    return true;
  }
  if (path === "auth/refresh" && req.method === "POST") {
    await refresh(req, res);
    return true;
  }
  if (path === "auth/logout" && req.method === "POST") {
    await logout(req, res);
    return true;
  }
  return false;
}
