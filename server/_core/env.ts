function clean(value: string | undefined) {
  return value?.trim() ?? "";
}

const supabasePublishableKey =
  clean(process.env.SUPABASE_PUBLISHABLE_KEY) ||
  // Server-only legacy fallback. Never read VITE_* here.
  clean(process.env.SUPABASE_ANON_KEY);

const supabaseSecretKey =
  clean(process.env.SUPABASE_SECRET_KEY) ||
  clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

// Keep the owner/admin e-mail server-only. OWNER_EMAIL is the preferred name,
// but ADMIN_EMAIL remains supported so older Vercel projects do not suddenly
// lose administrative access after a code update.
const ownerEmail =
  clean(process.env.OWNER_EMAIL) ||
  clean(process.env.ADMIN_EMAIL);

export const ENV = {
  // Legacy values kept only for source compatibility with unused preview helpers.
  appId: clean(process.env.APP_ID),
  cookieSecret: clean(process.env.JWT_SECRET),
  databaseUrl: clean(process.env.DATABASE_URL),

  // Supabase is configured exclusively on the server.
  // No Supabase key is read from import.meta.env / VITE_*.
  supabaseUrl: clean(process.env.SUPABASE_URL),
  supabasePublishableKey,
  supabaseSecretKey,
  supabaseServiceRoleKey: supabaseSecretKey,
  supabaseStorageBucket:
    clean(process.env.SUPABASE_STORAGE_BUCKET) || "portfolio-media",

  oAuthServerUrl: clean(process.env.OAUTH_SERVER_URL),
  ownerOpenId: clean(process.env.OWNER_OPEN_ID),
  ownerEmail: ownerEmail.toLowerCase(),
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: clean(process.env.BUILT_IN_FORGE_API_URL),
  forgeApiKey: clean(process.env.BUILT_IN_FORGE_API_KEY),
};

export function getSupabaseConfigStatus() {
  return {
    urlConfigured: Boolean(ENV.supabaseUrl),
    publishableKeyConfigured: Boolean(ENV.supabasePublishableKey),
    publishableKeyLooksValid:
      Boolean(ENV.supabasePublishableKey) &&
      !ENV.supabasePublishableKey.startsWith("sb_secret_"),
    secretKeyConfigured: Boolean(ENV.supabaseSecretKey),
    secretKeyLooksValid:
      Boolean(ENV.supabaseSecretKey) &&
      !ENV.supabaseSecretKey.startsWith("sb_publishable_"),
    ownerEmailConfigured: Boolean(ENV.ownerEmail),
    ownerEmailSource: clean(process.env.OWNER_EMAIL)
      ? "OWNER_EMAIL"
      : clean(process.env.ADMIN_EMAIL)
        ? "ADMIN_EMAIL"
        : null,
    storageBucket: ENV.supabaseStorageBucket,
  };
}

export function assertSupabaseAuthConfig() {
  if (!ENV.supabaseUrl) {
    throw new Error("SUPABASE_URL não está configurada na Vercel.");
  }

  if (!ENV.supabasePublishableKey) {
    throw new Error(
      "SUPABASE_PUBLISHABLE_KEY não está configurada na Vercel.",
    );
  }

  if (ENV.supabasePublishableKey.startsWith("sb_secret_")) {
    throw new Error(
      "SUPABASE_PUBLISHABLE_KEY recebeu uma Secret key (sb_secret_...). Use a Publishable key (sb_publishable_...).",
    );
  }
}

export function assertSupabaseServerConfig() {
  if (!ENV.supabaseUrl) {
    throw new Error("SUPABASE_URL não está configurada na Vercel.");
  }

  if (!ENV.supabaseSecretKey) {
    throw new Error("SUPABASE_SECRET_KEY não está configurada na Vercel.");
  }

  if (ENV.supabaseSecretKey.startsWith("sb_publishable_")) {
    throw new Error(
      "SUPABASE_SECRET_KEY recebeu uma Publishable key. Use a Secret key (sb_secret_...).",
    );
  }
}
