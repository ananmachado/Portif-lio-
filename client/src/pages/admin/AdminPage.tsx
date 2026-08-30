import React from "react";
import { Route, Switch, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";
import AdminDashboard from "./AdminDashboard";
import AdminAbout from "./AdminAbout";
import AdminCategories from "./AdminCategories";
import AdminProjects from "./AdminProjects";
import AdminProjectEditor from "./AdminProjectEditor";
import AdminAppearance from "./AdminAppearance";
import AdminContact from "./AdminContact";
import AdminSettings from "./AdminSettings";
import AdminUsers from "./AdminUsers";
import { canAccessAdmin } from "@shared/accessControl";

export default function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-background)" }}>
        <Loader2 className="animate-spin" size={32} aria-label="Verificando autenticação" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ background: "var(--color-background)" }}>
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Área Administrativa</h1>
        <p style={{ color: "var(--color-text-secondary)" }}>Você precisa estar autenticado para acessar esta área.</p>
        <Link href="/admin-login" className="editorial-button">Entrar como administrador</Link>
      </div>
    );
  }

  if (!canAccessAdmin(user.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ background: "var(--color-background)" }}>
        <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>Acesso restrito</h1>
        <p style={{ color: "var(--color-text-secondary)" }}>Você não tem permissão para acessar esta área administrativa.</p>
        <Link href="/" className="editorial-button">Voltar ao portfólio</Link>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/sobre" component={AdminAbout} />
      <Route path="/admin/categorias" component={AdminCategories} />
      <Route path="/admin/projetos" component={AdminProjects} />
      <Route path="/admin/projetos/:id" component={AdminProjectEditor} />
      <Route path="/admin/aparencia" component={AdminAppearance} />
      <Route path="/admin/contato" component={AdminContact} />
      <Route path="/admin/configuracoes" component={AdminSettings} />
      <Route path="/admin/usuarios" component={AdminUsers} />
    </Switch>
  );
}
