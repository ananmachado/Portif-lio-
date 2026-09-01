import type { IncomingMessage, ServerResponse } from "node:http";
import { app } from "../server/vercelApp";
import { getPortfolioHealthStatus } from "../server/health";

/**
 * Vercel entry point for the Express API.
 *
 * The server app is imported statically so Vercel's Node bundler includes the
 * local server modules in the deployed function. Using a runtime `import()`
 * here can leave the extensionless `/server/vercelApp` path unresolved in
 * Node ESM at runtime.
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

    req.url = `/api/${normalizedPath}${query ? `?${query}` : ""}`;

    if (normalizedPath === "health") {
      const health = await getPortfolioHealthStatus();
      res.statusCode = health.ok ? 200 : 503;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(JSON.stringify(health));
      return;
    }

    return (app as unknown as (request: unknown, response: unknown) => unknown)(req, res);
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
