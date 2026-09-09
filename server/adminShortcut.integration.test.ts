import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("integração do atalho administrativo", () => {
  it("faz a navegação e a Home respeitarem a lógica centralizada por papel", () => {
    const layout = source("client/src/components/PublicLayout.tsx");
    const home = source("client/src/pages/HomePage.tsx");

    expect(layout).toContain('import { showAdminLoginShortcut } from "@shared/adminShortcut"');
    expect(layout).toContain('showAdminLoginShortcut(user?.role)');
    expect(home).toContain('import { showAdminLoginShortcut } from "@shared/adminShortcut"');
    expect(home).toContain('showAdminLoginShortcut(user?.role)');
    expect(home).toContain('href="/admin-login"');
  });
});
