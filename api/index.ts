import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Vercel entry point for the Express API.
 *
 * /api/health is handled directly so configuration diagnostics do not depend
 * on the rest of the Express application being initialized. Other /api/*
 * routes are forwarded to the Express application after restoring the path
 * from the Vercel rewrite query parameter.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const host = req.headers.host || "localhost";
    const incomingUrl = new URL(req.url || "/api/index", `https://${host}`);
    const originalPath = incomingUrl.searchParams.get("__path") || "";

    incomingUrl.searchParams.delete("__path");
    const query = incomingUrl.searchParams.toString();

    const normalizedPath = originalPath
      .split("/")
      .filter(Boolean)
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
      .join("/");

    req.url = `/api/${normalizedPath}${query ? `?${query}` : ""}`;

    // Health is intentionally answered without loading the whole application.
    if (normalizedPath === "health") {
      const { getSupabaseConfigStatus } = await import("../server/_core/env");
      const supabase = getSupabaseConfigStatus();
      const ok =
        supabase.urlConfigured &&
        supabase.publishableKeyConfigured &&
        supabase.publishableKeyLooksValid &&
        supabase.secretKeyConfigured &&
        supabase.secretKeyLooksValid &&
        supabase.ownerEmailConfigured;

      res.statusCode = ok ? 200 : 503;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(
        JSON.stringify({
          ok,
          service: "portfolio-api",
          supabase,
        }),
      );
      return;
    }

    const { app } = await import("../server/vercelApp");
    return (app as unknown as (request: IncomingMessage, response: ServerResponse) => unknown)(
      req,
      res,
    );
  } catch (error) {
    console.error("[Vercel Function]", error);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        error: "FUNCTION_INVOCATION_FAILED",
        message: error instanceof Error ? error.message : "Internal server error",
      }),
    );
  }
}
