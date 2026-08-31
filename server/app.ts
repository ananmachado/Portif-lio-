import express, { type Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { storagePut } from "./storage";
import { registerSupabaseAuthRoutes } from "./auth";
import { getSupabaseConfigStatus } from "./_core/env";

export function createApp(): Express {
  const app = express();

  app.set("trust proxy", 1);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerSupabaseAuthRoutes(app);

  // File uploads are handled by the Vercel Node function and stored in Supabase Storage.
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

  app.get("/api/health", (_req, res) => {
    const supabase = getSupabaseConfigStatus();
    const ok =
      supabase.urlConfigured &&
      supabase.publishableKeyConfigured &&
      supabase.publishableKeyLooksValid &&
      supabase.secretKeyConfigured &&
      supabase.secretKeyLooksValid &&
      supabase.ownerEmailConfigured;

    res.status(ok ? 200 : 503).json({
      ok,
      service: "portfolio-api",
      supabase,
    });
  });

  return app;
}

export const app = createApp();
