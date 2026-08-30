import React, { useState } from "react";
import { ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import AdminLayout from "./AdminLayout";

type PendingRoleChange = { id: number; name: string; role: "user" | "admin" } | null;

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const utils = trpc.useUtils();
  const { data: users, isLoading, error } = trpc.users.list.useQuery();
  const [pendingChange, setPendingChange] = useState<PendingRoleChange>(null);
  const changeRole = trpc.users.updateRole.useMutation({
    onSuccess: () => { toast.success("Papel de acesso atualizado."); setPendingChange(null); utils.users.list.invalidate(); },
    onError: (mutationError) => toast.error(mutationError.message || "Não foi possível atualizar o papel."),
  });

  return (
    <AdminLayout title="Usuários e acessos">
      <div className="admin-users-intro">
        <div><p className="site-eyebrow">Controle de acesso</p><p>Todo cadastro começa como usuário comum. Promova uma pessoa a administradora somente quando ela realmente precisar gerenciar o portfólio.</p></div>
        <div className="admin-users-summary"><UsersRound size={20} aria-hidden="true" /><strong>{users?.length ?? 0}</strong><span>contas cadastradas</span></div>
      </div>

      {isLoading ? <p className="admin-empty" aria-busy="true">Carregando contas…</p> : error ? <p className="admin-empty" role="alert">Não foi possível carregar os usuários. Atualize a página e tente novamente.</p> : (
        <div className="admin-users-list" aria-label="Usuários cadastrados">
          {users?.map((account) => {
            const isCurrent = account.id === currentUser?.id;
            const nextRole = account.role === "admin" ? "user" : "admin";
            return (
              <article key={account.id} className="admin-user-card">
                <div className="admin-user-card__avatar" aria-hidden="true">{(account.name || "U").slice(0, 1).toUpperCase()}</div>
                <div className="min-w-0 flex-1"><h2>{account.name || "Usuário sem nome"}{isCurrent && <span className="admin-user-card__current">Você</span>}</h2><p>{account.email || "E-mail não informado"}</p><p className="admin-user-card__meta">Criado em {new Date(account.createdAt).toLocaleDateString("pt-BR")}</p></div>
                <div className={`admin-role-badge ${account.role === "admin" ? "admin-role-badge--admin" : ""}`}>{account.role === "admin" ? <ShieldCheck size={15} aria-hidden="true" /> : <UserRound size={15} aria-hidden="true" />}{account.role === "admin" ? "Administrador" : "Usuário"}</div>
                {!isCurrent && <Button variant="outline" onClick={() => setPendingChange({ id: account.id, name: account.name || "este usuário", role: nextRole })}>{nextRole === "admin" ? "Tornar admin" : "Remover admin"}</Button>}
              </article>
            );
          })}
        </div>
      )}

      {pendingChange && (
        <div className="role-confirmation" role="alertdialog" aria-modal="true" aria-labelledby="role-confirmation-title" aria-describedby="role-confirmation-description">
          <div><p className="site-eyebrow">Confirmação necessária</p><h2 id="role-confirmation-title">Alterar papel de acesso?</h2><p id="role-confirmation-description">{pendingChange.name} passará a ser <strong>{pendingChange.role === "admin" ? "administrador" : "usuário comum"}</strong>. {pendingChange.role === "admin" ? "Administradores podem publicar, editar e configurar todo o portfólio." : "A pessoa deixará de acessar os recursos administrativos."}</p></div>
          <div className="flex gap-3 flex-wrap"><Button variant="outline" onClick={() => setPendingChange(null)} disabled={changeRole.isPending}>Cancelar</Button><Button onClick={() => changeRole.mutate({ id: pendingChange.id, role: pendingChange.role })} disabled={changeRole.isPending}>{changeRole.isPending ? "Atualizando…" : "Confirmar alteração"}</Button></div>
        </div>
      )}
    </AdminLayout>
  );
}
