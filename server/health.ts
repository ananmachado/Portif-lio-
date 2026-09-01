import { getSupabaseConfigStatus } from "./_core/env";
import { probePortfolioDatabase } from "./db";

export async function getPortfolioHealthStatus() {
  const supabase = getSupabaseConfigStatus();
  const envOk =
    supabase.urlConfigured &&
    supabase.publishableKeyConfigured &&
    supabase.publishableKeyLooksValid &&
    supabase.secretKeyConfigured &&
    supabase.secretKeyLooksValid &&
    supabase.ownerEmailConfigured;

  const database =
    supabase.urlConfigured &&
    supabase.secretKeyConfigured &&
    supabase.secretKeyLooksValid
      ? await probePortfolioDatabase()
      : {
          ok: false,
          status: null,
          message: "Teste da Data API não executado porque a configuração do servidor está incompleta.",
        };

  return {
    ok: Boolean(envOk && database.ok),
    service: "portfolio-api",
    supabase,
    database,
  };
}
