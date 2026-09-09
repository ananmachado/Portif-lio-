import { describe, expect, it } from "vitest";
import { canAccessAdmin, postLoginDestination, safePostLoginDestination } from "../shared/accessControl";

describe("guardas de acesso por papel", () => {
  it("bloqueia um usuário comum e libera um administrador para a área administrativa", () => {
    expect(canAccessAdmin("user")).toBe(false);
    expect(canAccessAdmin("admin")).toBe(true);
  });

  it("direciona cada papel para sua área apropriada após login", () => {
    expect(postLoginDestination("user")).toBe("/conta");
    expect(postLoginDestination("admin")).toBe("/admin");
  });

  it("não permite que usuário comum seja redirecionado para uma rota administrativa solicitada", () => {
    expect(safePostLoginDestination("user", "/admin/usuarios")).toBe("/conta");
    expect(safePostLoginDestination("admin", "/admin/usuarios")).toBe("/admin/usuarios");
  });
});
