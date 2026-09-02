import type { IncomingMessage, ServerResponse } from "node:http";
import { handleDirectAuthRequest } from "../server/authApi.ts";
import { getPortfolioHealthStatus } from "../server/health.ts";

function sendJson(res: ServerResponse, status: number, body: unknown) {
  if (res.headersSent) return;
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

/**
 * Vercel entry point.
 *
 * IMPORTANT: Auth and health are handled before the Express/tRPC application is
 * imported. This prevents an unrelated startup error in the admin API bundle
 * from crashing /api/auth/login with Vercel's generic FUNCTION_INVOCATION_FAILED.
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
      .map((segment) => {
        try {
          return encodeURIComponent(decodeURIComponent(segment));
        } catch {
          return encodeURIComponent(segment);
        }
      })
      .join("/");

    if (normalizedPath === "health") {
      const health = await getPortfolioHealthStatus();
      sendJson(res, health.ok ? 200 : 503, health);
      return;
    }

    if (await handleDirectAuthRequest(normalizedPath, req, res)) {
      return;
    }

    req.url = `/api/${normalizedPath}${query ? `?${query}` : ""}`;

    // Load the heavier Express/tRPC application only when it is actually needed.
    // Using a literal TypeScript extension makes the dependency explicit to the
    // Vercel bundler and keeps import failures inside this try/catch.
    const { app } = await import("../server/vercelApp.ts");
    (app as unknown as (request: unknown, response: unknown) => void)(req, res);
  } catch (error) {
    console.error("[Vercel API]", error);
    sendJson(res, 500, {
      error: "PORTFOLIO_API_STARTUP_FAILED",
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
