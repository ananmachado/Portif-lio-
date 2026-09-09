import { describe, expect, it } from "vitest";
import { roleChangeDenialReason } from "./authorization";

describe("política de gestão de papéis", () => {
  it("impede que um administrador altere o próprio papel", () => {
    expect(roleChangeDenialReason({ actorId: 7, target: { id: 7, openId: "admin-7" }, ownerOpenId: "owner-1" })).toBe("Você não pode alterar o próprio papel.");
  });

  it("impede que qualquer administrador altere a conta proprietária", () => {
    expect(roleChangeDenialReason({ actorId: 7, target: { id: 1, openId: "owner-1" }, ownerOpenId: "owner-1" })).toBe("A conta proprietária não pode ter o papel alterado.");
  });

  it("permite promover ou revogar um usuário que não é a conta proprietária", () => {
    expect(roleChangeDenialReason({ actorId: 7, target: { id: 8, openId: "user-8" }, ownerOpenId: "owner-1" })).toBeNull();
  });
});
