export type RoleChangeTarget = {
  id: number;
  openId: string;
};

export function roleChangeDenialReason(input: {
  actorId: number;
  target: RoleChangeTarget;
  ownerOpenId: string;
}): string | null {
  if (input.actorId === input.target.id) return "Você não pode alterar o próprio papel.";
  if (input.target.openId === input.ownerOpenId) return "A conta proprietária não pode ter o papel alterado.";
  return null;
}
