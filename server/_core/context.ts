import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { resolveAuthenticatedPortfolioUser } from "../auth.js";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

/**
 * Production authentication context.
 * Authentication is resolved exclusively on the server from HTTP-only cookies.
 * The browser never sends or stores a Supabase access/refresh token itself.
 */
export async function createContext(
  opts: CreateExpressContextOptions,
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await resolveAuthenticatedPortfolioUser(opts.req, opts.res);
  } catch (error) {
    console.warn("[Auth] Could not resolve Supabase session:", error);
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
