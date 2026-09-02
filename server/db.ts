import { assertSupabaseServerConfig, ENV } from "./_core/env.js";
import type {
  Category,
  InsertCategory,
  InsertPortfolioSettings,
  InsertProject,
  InsertProjectBlock,
  InsertUser,
  PortfolioSettings,
  Project,
  ProjectBlock,
  User,
} from "../drizzle/schema";

function getSupabaseConfig() {
  assertSupabaseServerConfig();

  return {
    baseUrl: ENV.supabaseUrl.replace(/\/+$/, ""),
    serverKey: ENV.supabaseSecretKey,
  };
}

type Filter = [column: string, operator: string, value: string | number | boolean | null];

async function supabaseRequest<T>(
  table: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    filters?: Filter[];
    order?: { column: string; ascending?: boolean };
    limit?: number;
    body?: unknown;
    upsertOn?: string;
    select?: string;
  } = {},
): Promise<T> {
  const { baseUrl, serverKey } = getSupabaseConfig();
  const url = new URL(`${baseUrl}/rest/v1/${table}`);
  const method = options.method ?? "GET";

  if (options.select) url.searchParams.set("select", options.select);
  if (options.filters) {
    for (const [column, operator, value] of options.filters) {
      url.searchParams.set(column, `${operator}.${String(value)}`);
    }
  }
  if (options.order) {
    url.searchParams.set(
      "order",
      `${options.order.column}.${options.order.ascending === false ? "desc" : "asc"}`,
    );
  }
  if (options.limit !== undefined) url.searchParams.set("limit", String(options.limit));
  if (options.upsertOn) url.searchParams.set("on_conflict", options.upsertOn);

  const headers: Record<string, string> = {
    apikey: serverKey,
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    headers.Prefer = options.upsertOn
      ? "resolution=merge-duplicates,return=representation"
      : "return=representation";
  } else if (method === "DELETE") {
    headers.Prefer = "return=representation";
  }

  const response = await fetch(url, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Supabase ${method} ${table} failed (${response.status}): ${detail || response.statusText}`,
    );
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

async function selectOne<T>(table: string, filters: Filter[]): Promise<T | undefined> {
  const rows = await supabaseRequest<T[]>(table, { filters, limit: 1 });
  return rows[0];
}

async function selectMany<T>(
  table: string,
  filters: Filter[] = [],
  order?: { column: string; ascending?: boolean },
): Promise<T[]> {
  return supabaseRequest<T[]>(table, { filters, order });
}

async function insertOne<T>(table: string, body: unknown): Promise<T> {
  const rows = await supabaseRequest<T[]>(table, {
    method: "POST",
    body,
  });
  if (!rows?.[0]) throw new Error(`Supabase did not return the inserted ${table} row`);
  return rows[0];
}

async function updateOne<T>(table: string, id: number, body: unknown): Promise<T | undefined> {
  const rows = await supabaseRequest<T[]>(table, {
    method: "PATCH",
    filters: [["id", "eq", id]],
    body,
  });
  return rows[0];
}

async function updateWhere<T>(table: string, filters: Filter[], body: unknown): Promise<T[]> {
  return supabaseRequest<T[]>(table, {
    method: "PATCH",
    filters,
    body,
  });
}

async function deleteWhere(table: string, filters: Filter[]): Promise<void> {
  await supabaseRequest(table, { method: "DELETE", filters });
}


export type PortfolioDatabaseProbe = {
  ok: boolean;
  status: number | null;
  message: string;
};

/**
 * Safe production diagnostic used by /api/health. It verifies that the Vercel
 * function can actually reach the portfolio tables with the configured server
 * key, without returning rows or secrets to the browser.
 */
export async function probePortfolioDatabase(): Promise<PortfolioDatabaseProbe> {
  try {
    const { baseUrl, serverKey } = getSupabaseConfig();
    const url = new URL(`${baseUrl}/rest/v1/users`);
    url.searchParams.set("select", "id");
    url.searchParams.set("limit", "1");

    const response = await fetch(url, {
      headers: {
        apikey: serverKey,
        Accept: "application/json",
      },
    });

    if (response.ok) {
      return {
        ok: true,
        status: response.status,
        message: "Data API e public.users acessíveis pelo servidor.",
      };
    }

    const status = response.status;
    const message =
      status === 401
        ? "SUPABASE_SECRET_KEY/SERVICE_ROLE inválida para este projeto."
        : status === 403
          ? "A chave de servidor não tem acesso à Data API/public.users. Rode o SQL de permissões."
          : status === 404
            ? "public.users não foi encontrada/exposta na Data API. Rode supabase/schema.sql."
            : `Data API respondeu HTTP ${status}.`;

    return { ok: false, status, message };
  } catch (error) {
    return {
      ok: false,
      status: null,
      message: error instanceof Error ? error.message : "Falha ao verificar a Data API.",
    };
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const requestedRole =
    user.role !== undefined
      ? user.role
      : user.openId === ENV.ownerOpenId
        ? "admin"
        : undefined;

  // IMPORTANT: do not use a PostgREST UPSERT here. During an upsert, omitted
  // columns can be filled from database defaults on the INSERT side of the
  // operation. For the `role` column that default is `user`, which makes an
  // authentication sync a dangerous place to merge authorization data.
  //
  // Instead, update an existing row using only the fields we explicitly want
  // to change. This guarantees that an existing `role = admin` survives login.
  const existing = await getUserByOpenId(user.openId);
  const mutableValues: Record<string, unknown> = {
    ...(user.name !== undefined ? { name: user.name ?? null } : {}),
    ...(user.email !== undefined ? { email: user.email ?? null } : {}),
    ...(user.loginMethod !== undefined ? { loginMethod: user.loginMethod ?? null } : {}),
    ...(user.lastSignedIn !== undefined
      ? { lastSignedIn: user.lastSignedIn }
      : { lastSignedIn: new Date() }),
    ...(requestedRole !== undefined ? { role: requestedRole } : {}),
  };

  if (existing) {
    await updateWhere<User>(
      "users",
      [["openId", "eq", user.openId]],
      mutableValues,
    );
    return;
  }

  try {
    await insertOne<User>("users", {
      openId: user.openId,
      ...mutableValues,
      role: requestedRole ?? "user",
    });
  } catch (error) {
    // If two requests create the same user concurrently, preserve the row that
    // won the race and update it without touching its role unnecessarily.
    const raced = await getUserByOpenId(user.openId);
    if (!raced) throw error;

    await updateWhere<User>(
      "users",
      [["openId", "eq", user.openId]],
      mutableValues,
    );
  }
}

export async function getUserByOpenId(openId: string) {
  return selectOne<User>("users", [["openId", "eq", openId]]);
}

export async function getUserById(id: number) {
  return selectOne<User>("users", [["id", "eq", id]]);
}

export async function getUserByEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return undefined;
  return selectOne<User>("users", [["email", "ilike", normalized]]);
}

export async function getPortfolioOwnerUser() {
  if (ENV.ownerEmail) {
    const configuredOwner = await getUserByEmail(ENV.ownerEmail);
    if (configuredOwner) return configuredOwner;
  }

  const admins = await selectMany<User>(
    "users",
    [["role", "eq", "admin"]],
    { column: "createdAt", ascending: true },
  );
  return admins[0];
}

export async function listUsersForAdmin() {
  return selectMany<User>("users", [], { column: "createdAt", ascending: true });
}

export async function setUserRole(id: number, role: "user" | "admin") {
  await updateOne<User>("users", id, { role });
  return getUserById(id);
}

// ─── Portfolio Settings ────────────────────────────────────────────────────────
export async function getOrCreateSettings(userId: number) {
  const existing = await selectOne<PortfolioSettings>("portfolio_settings", [["userId", "eq", userId]]);
  if (existing) return existing;

  try {
    return await insertOne<PortfolioSettings>("portfolio_settings", { userId });
  } catch {
    // A concurrent request may have created the settings row.
    const retry = await selectOne<PortfolioSettings>("portfolio_settings", [["userId", "eq", userId]]);
    if (!retry) throw new Error("Could not create portfolio settings");
    return retry;
  }
}

export async function updateSettings(userId: number, data: Partial<InsertPortfolioSettings>) {
  await getOrCreateSettings(userId);
  await updateWhere<PortfolioSettings>("portfolio_settings", [["userId", "eq", userId]], data);
  return getOrCreateSettings(userId);
}

export async function getPublicSettings(userId: number) {
  return selectOne<PortfolioSettings>("portfolio_settings", [["userId", "eq", userId]]);
}

// ─── Categories ───────────────────────────────────────────────────────────────
export async function getCategoriesByUser(userId: number) {
  return selectMany<Category>("categories", [["userId", "eq", userId]], {
    column: "displayOrder",
    ascending: true,
  });
}

export async function createCategory(data: InsertCategory) {
  return insertOne<Category>("categories", data);
}

export async function updateCategory(id: number, userId: number, data: Partial<InsertCategory>) {
  const rows = await updateWhere<Category>(
    "categories",
    [
      ["id", "eq", id],
      ["userId", "eq", userId],
    ],
    data,
  );
  return rows[0];
}

export async function deleteCategory(id: number, userId: number) {
  await deleteWhere("categories", [
    ["id", "eq", id],
    ["userId", "eq", userId],
  ]);
}

export async function moveCategoryProjects(fromCategoryId: number, toCategoryId: number | null, userId: number) {
  await updateWhere<Project>(
    "projects",
    [
      ["categoryId", "eq", fromCategoryId],
      ["userId", "eq", userId],
    ],
    { categoryId: toCategoryId },
  );
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export async function getProjectsByUser(userId: number) {
  return selectMany<Project>("projects", [["userId", "eq", userId]], {
    column: "displayOrder",
    ascending: true,
  });
}

export async function getPublishedProjects(userId: number) {
  return selectMany<Project>(
    "projects",
    [
      ["userId", "eq", userId],
      ["status", "eq", "published"],
    ],
    { column: "displayOrder", ascending: true },
  );
}

export async function getProjectBySlug(slug: string, userId: number) {
  return selectOne<Project>("projects", [
    ["slug", "eq", slug],
    ["userId", "eq", userId],
  ]);
}

export async function getProjectById(id: number, userId: number) {
  return selectOne<Project>("projects", [
    ["id", "eq", id],
    ["userId", "eq", userId],
  ]);
}

export async function createProject(data: InsertProject) {
  return insertOne<Project>("projects", data);
}

export async function updateProject(id: number, userId: number, data: Partial<InsertProject>) {
  const rows = await updateWhere<Project>(
    "projects",
    [
      ["id", "eq", id],
      ["userId", "eq", userId],
    ],
    data,
  );
  return rows[0];
}

export async function deleteProject(id: number, userId: number) {
  await deleteWhere("project_blocks", [
    ["projectId", "eq", id],
    ["userId", "eq", userId],
  ]);
  await deleteWhere("projects", [
    ["id", "eq", id],
    ["userId", "eq", userId],
  ]);
}

// ─── Project Blocks ───────────────────────────────────────────────────────────
export async function getBlocksByProject(projectId: number, userId: number) {
  return selectMany<ProjectBlock>(
    "project_blocks",
    [
      ["projectId", "eq", projectId],
      ["userId", "eq", userId],
    ],
    { column: "displayOrder", ascending: true },
  );
}

export async function getPublicBlocksByProject(projectId: number) {
  return selectMany<ProjectBlock>(
    "project_blocks",
    [["projectId", "eq", projectId]],
    { column: "displayOrder", ascending: true },
  );
}

export async function createBlock(data: InsertProjectBlock) {
  return insertOne<ProjectBlock>("project_blocks", data);
}

export async function updateBlock(id: number, userId: number, data: Partial<InsertProjectBlock>) {
  const rows = await updateWhere<ProjectBlock>(
    "project_blocks",
    [
      ["id", "eq", id],
      ["userId", "eq", userId],
    ],
    data,
  );
  return rows[0];
}

export async function deleteBlock(id: number, userId: number) {
  await deleteWhere("project_blocks", [
    ["id", "eq", id],
    ["userId", "eq", userId],
  ]);
}

export async function reorderBlocks(projectId: number, userId: number, orderedIds: number[]) {
  await Promise.all(
    orderedIds.map((id, idx) =>
      updateWhere<ProjectBlock>(
        "project_blocks",
        [
          ["id", "eq", id],
          ["projectId", "eq", projectId],
          ["userId", "eq", userId],
        ],
        { displayOrder: idx },
      ),
    ),
  );
}

export async function reorderProjects(userId: number, orderedIds: number[]) {
  await Promise.all(
    orderedIds.map((id, idx) =>
      updateWhere<Project>("projects", [["id", "eq", id], ["userId", "eq", userId]], { displayOrder: idx }),
    ),
  );
}

export async function reorderCategories(userId: number, orderedIds: number[]) {
  await Promise.all(
    orderedIds.map((id, idx) =>
      updateWhere<Category>("categories", [["id", "eq", id], ["userId", "eq", userId]], { displayOrder: idx }),
    ),
  );
}
