import { describe, expect, it } from "vitest";
import { adminShortcutHref, showAdminLoginShortcut } from "../shared/adminShortcut";

describe("atalhos administrativos por papel", () => {
  it("mostra o atalho de login administrativo para visitante e usuário comum", () => {
    expect(showAdminLoginShortcut(null)).toBe(true);
    expect(showAdminLoginShortcut("user")).toBe(true);
    expect(adminShortcutHref(null)).toBe("/admin-login");
    expect(adminShortcutHref("user")).toBe("/admin-login");
  });

  it("oculta o atalho extra para administrador e direciona ao painel", () => {
    expect(showAdminLoginShortcut("admin")).toBe(false);
    expect(adminShortcutHref("admin")).toBe("/admin");
  });
});
