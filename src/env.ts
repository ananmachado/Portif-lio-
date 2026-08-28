function clean(value: string | undefined) {
  return value?.trim() ?? "";
}

export const ENV = {
  // Legacy Manus/OAuth values are server-only. Do not use VITE_* for secrets.
  appId: clean(process.env.APP_ID),
  cookieSecret: clean(process.env.JWT_SECRET),
  databaseUrl: clean(process.env.DATABASE_URL),

  // Supabase is configured exclusively on the server in Vercel.
  // None of these values are injected into the Vite browser bundle.
  supabaseUrl: clean(process.env.SUPABASE_URL),
  supabasePublishableKey: clean(process.env.SUPABASE_PUBLISHABLE_KEY),
  supabaseSecretKey:
    clean(process.env.SUPABASE_SECRET_KEY) ||
    clean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  supabaseServiceRoleKey:
    clean(process.env.SUPABASE_SECRET_KEY) ||
    clean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  supabaseStorageBucket:
    clean(process.env.SUPABASE_STORAGE_BUCKET) || "portfolio-media",

  oAuthServerUrl: clean(process.env.OAUTH_SERVER_URL),
  ownerOpenId: clean(process.env.OWNER_OPEN_ID),
  ownerEmail: clean(process.env.OWNER_EMAIL).toLowerCase(),
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: clean(process.env.BUILT_IN_FORGE_API_URL),
  forgeApiKey: clean(process.env.BUILT_IN_FORGE_API_KEY),
};
