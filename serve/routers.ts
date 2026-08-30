import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import {
  getOrCreateSettings,
  updateSettings,
  getPublicSettings,
  getCategoriesByUser,
  createCategory,
  updateCategory,
  deleteCategory,
  moveCategoryProjects,
  getProjectsByUser,
  getPublishedProjects,
  getProjectBySlug,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getBlocksByProject,
  getPublicBlocksByProject,
  createBlock,
  updateBlock,
  deleteBlock,
  reorderBlocks,
  reorderProjects,
  reorderCategories,
  getUserById,
  getPortfolioOwnerUser,
  listUsersForAdmin,
  setUserRole,
} from "./db";
import type { ThemeConfig } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { roleChangeDenialReason } from "./authorization";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// ─── Admin guard ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
  return next({ ctx });
});

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Usuários e papéis ───────────────────────────────────────────────────────
  users: router({
    list: adminProcedure.query(() => listUsersForAdmin()),

    updateRole: adminProcedure
      .input(z.object({ id: z.number(), role: z.enum(["user", "admin"]) }))
      .mutation(async ({ ctx, input }) => {
        const target = await getUserById(input.id);
        if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado." });
        const denialReason = roleChangeDenialReason({ actorId: ctx.user.id, target, ownerOpenId: ENV.ownerOpenId });
        if (denialReason) throw new TRPCError({ code: "FORBIDDEN", message: denialReason });

        return setUserRole(input.id, input.role);
      }),
  }),

  // ─── Settings ───────────────────────────────────────────────────────────────
  settings: router({
    get: adminProcedure.query(({ ctx }) => getOrCreateSettings(ctx.user.id)),

    getPublic: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(({ input }) => getPublicSettings(input.userId)),

    getPublicPortfolio: publicProcedure.query(async () => {
      const owner = await getPortfolioOwnerUser();
      if (!owner) return null;
      return {
        ownerId: owner.id,
        settings: await getPublicSettings(owner.id),
      };
    }),

    update: adminProcedure
      .input(
        z.object({
          portfolioName: z.string().max(255).optional(),
          tagline: z.string().max(500).optional(),
          aboutTitle: z.string().max(255).optional(),
          aboutText: z.string().optional(),
          shortBio: z.string().optional(),
          whatsapp: z.string().max(30).optional(),
          emailPublic: z.string().max(320).optional(),
          location: z.string().max(255).optional(),
          socialLinks: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
          contactIntro: z.string().optional(),
          uxVoice: z.string().max(64).optional(),
          themeConfig: z.record(z.string(), z.string()).optional(),
          profileImageUrl: z.string().optional(),
          profileImageKey: z.string().optional(),
          faviconUrl: z.string().optional(),
          faviconKey: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) => updateSettings(ctx.user.id, input as Parameters<typeof updateSettings>[1])),
  }),

  // ─── Upload ─────────────────────────────────────────────────────────────────
  upload: router({
    getUploadUrl: adminProcedure
      .input(z.object({ filename: z.string(), contentType: z.string(), folder: z.string().default("media") }))
      .mutation(async ({ ctx, input }) => {
        const ext = input.filename.split(".").pop() ?? "bin";
        const key = `${ctx.user.id}/${input.folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        return { key, uploadEndpoint: `/api/upload?key=${encodeURIComponent(key)}&contentType=${encodeURIComponent(input.contentType)}` };
      }),
  }),

  // ─── Categories ─────────────────────────────────────────────────────────────
  categories: router({
    list: adminProcedure.query(({ ctx }) => getCategoriesByUser(ctx.user.id)),

    listPublic: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(({ input }) => getCategoriesByUser(input.userId)),

    create: adminProcedure
      .input(z.object({ name: z.string().min(1).max(255), description: z.string().optional() }))
      .mutation(({ ctx, input }) =>
        createCategory({ userId: ctx.user.id, name: input.name, slug: slugify(input.name), description: input.description ?? "" })
      ),

    update: adminProcedure
      .input(z.object({ id: z.number(), name: z.string().min(1).max(255).optional(), description: z.string().optional(), displayOrder: z.number().optional() }))
      .mutation(({ ctx, input }) => {
        const { id, ...data } = input;
        const update: Record<string, unknown> = { ...data };
        if (data.name) update.slug = slugify(data.name);
        return updateCategory(id, ctx.user.id, update);
      }),

    reorder: adminProcedure
      .input(z.object({ orderedIds: z.array(z.number()) }))
      .mutation(({ ctx, input }) => reorderCategories(ctx.user.id, input.orderedIds)),

    delete: adminProcedure
      .input(z.object({ id: z.number(), strategy: z.enum(["cancel", "move", "unlink"]), moveToCategoryId: z.number().nullable().optional() }))
      .mutation(async ({ ctx, input }) => {
        if (input.strategy === "cancel") return { success: false };
        if (input.strategy === "move" && input.moveToCategoryId != null) {
          await moveCategoryProjects(input.id, input.moveToCategoryId, ctx.user.id);
        } else if (input.strategy === "unlink") {
          await moveCategoryProjects(input.id, null, ctx.user.id);
        }
        await deleteCategory(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ─── Projects ───────────────────────────────────────────────────────────────
  projects: router({
    list: adminProcedure.query(({ ctx }) => getProjectsByUser(ctx.user.id)),

    listPublished: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(({ input }) => getPublishedProjects(input.userId)),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string(), userId: z.number() }))
      .query(({ input }) => getProjectBySlug(input.slug, input.userId)),

    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(({ ctx, input }) => getProjectById(input.id, ctx.user.id)),

    create: adminProcedure
      .input(
        z.object({
          title: z.string().min(1).max(255),
          categoryId: z.number().nullable().optional(),
          shortDescription: z.string().optional(),
          year: z.string().max(10).optional(),
          metaDescription: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        createProject({ userId: ctx.user.id, title: input.title, slug: slugify(input.title), categoryId: input.categoryId ?? null, shortDescription: input.shortDescription ?? "", year: input.year ?? "", metaDescription: input.metaDescription ?? "" })
      ),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().min(1).max(255).optional(),
          categoryId: z.number().nullable().optional(),
          shortDescription: z.string().optional(),
          coverImageUrl: z.string().optional(),
          coverImageKey: z.string().optional(),
          coverImageAlt: z.string().optional(),
          year: z.string().max(10).optional(),
          status: z.enum(["draft", "published"]).optional(),
          featured: z.boolean().optional(),
          displayOrder: z.number().optional(),
          metaDescription: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        const { id, title, ...rest } = input;
        const data: Record<string, unknown> = { ...rest };
        if (title) { data.title = title; data.slug = slugify(title); }
        return updateProject(id, ctx.user.id, data);
      }),

    reorder: adminProcedure
      .input(z.object({ orderedIds: z.array(z.number()) }))
      .mutation(({ ctx, input }) => reorderProjects(ctx.user.id, input.orderedIds)),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => deleteProject(input.id, ctx.user.id)),
  }),

  // ─── Blocks ─────────────────────────────────────────────────────────────────
  blocks: router({
    list: adminProcedure
      .input(z.object({ projectId: z.number() }))
      .query(({ ctx, input }) => getBlocksByProject(input.projectId, ctx.user.id)),

    listPublic: publicProcedure
      .input(z.object({ projectId: z.number() }))
      .query(({ input }) => getPublicBlocksByProject(input.projectId)),

    create: adminProcedure
      .input(
        z.object({
          projectId: z.number(),
          type: z.enum(["text", "image", "youtube", "audio"]),
          content: z.string().optional(),
          mediaUrl: z.string().optional(),
          mediaKey: z.string().optional(),
          altText: z.string().optional(),
          caption: z.string().optional(),
          transcript: z.string().optional(),
          displayOrder: z.number().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        createBlock({ ...input, userId: ctx.user.id, content: input.content ?? "", mediaUrl: input.mediaUrl ?? "", mediaKey: input.mediaKey ?? "", altText: input.altText ?? "", caption: input.caption ?? "", transcript: input.transcript ?? "", displayOrder: input.displayOrder ?? 0 })
      ),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          content: z.string().optional(),
          mediaUrl: z.string().optional(),
          mediaKey: z.string().optional(),
          altText: z.string().optional(),
          caption: z.string().optional(),
          transcript: z.string().optional(),
        })
      )
      .mutation(({ ctx, input }) => {
        const { id, ...data } = input;
        return updateBlock(id, ctx.user.id, data);
      }),

    reorder: adminProcedure
      .input(z.object({ projectId: z.number(), orderedIds: z.array(z.number()) }))
      .mutation(({ ctx, input }) => reorderBlocks(input.projectId, ctx.user.id, input.orderedIds)),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => deleteBlock(input.id, ctx.user.id)),
  }),
});

export type AppRouter = typeof appRouter;
