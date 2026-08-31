import type { IncomingMessage, ServerResponse } from "node:http";
import { app } from "../server/vercelApp";

/**
 * Stable Vercel entry point for the whole Express API.
 *
 * Vercel rewrites every /api/* request to this single static function and
 * passes the original API path in the __path query parameter. We restore the
 * original URL before handing the request to Express so existing routes keep
 * working unchanged (/api/auth/login, /api/trpc/*, /api/upload, etc.).
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
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

  return app(req, res);
}
