import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers.js";
import { createContext } from "./_core/context.js";
import { storagePut } from "./storage.js";
import { registerSupabaseAuthRoutes } from "./auth.js";
import { getPortfolioHealthStatus } from "./health.js";

/**
 * Vercel-only Express application.
 * It intentionally does not register the legacy Manus/OAuth routes because
 * those routes pull in preview-only modules that are not needed in production.
 */
export function createVercelApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerSupabaseAuthRoutes(app);

  app.post(
    "/api/upload",
    express.raw({ type: "*/*", limit: "20mb" }),
    async (req, res) => {
      try {
        const ctx = await createContext({ req, res } as Parameters<typeof createContext>[0]);
        if (!ctx.user || ctx.user.role !== "admin") {
          res.status(403).json({ error: "Forbidden" });
          return;
        }

        const key = req.query.key as string;
        const contentType =
          (req.query.contentType as string) ||
          req.headers["content-type"] ||
          "application/octet-stream";

        if (!key) {
          res.status(400).json({ error: "Missing key" });
          return;
        }

        const { url } = await storagePut(key, req.body as Buffer, contentType);
        res.json({ url, key });
      } catch (error) {
        console.error("[Upload]", error);
        res.status(500).json({
          error: error instanceof Error ? error.message : "Upload failed",
        });
      }
    },
  );

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    }),
  );

  app.get("/api/health", async (_req, res) => {
    const health = await getPortfolioHealthStatus();
    res.status(health.ok ? 200 : 503).json(health);
  });

  app.use((error: unknown, _req: any, res: any, _next: any) => {
    console.error("[Express] Unhandled error", error);
    if (res.headersSent) return;
    res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  });

  return app;
}

export const app = createVercelApp();
