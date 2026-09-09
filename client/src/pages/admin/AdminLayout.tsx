import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  LayoutDashboard,
  User,
  FolderOpen,
  Briefcase,
  Palette,
  Phone,
  Settings,
  LogOut,
  ExternalLink,
  UsersRound,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/sobre", label: "Sobre", icon: User },
  { href: "/admin/projetos", label: "Projetos", icon: Briefcase },
  { href: "/admin/categorias", label: "Categorias", icon: FolderOpen },
  { href: "/admin/aparencia", label: "Aparência", icon: Palette },
  { href: "/admin/contato", label: "Contato", icon: Phone },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
  { href: "/admin/usuarios", label: "Usuários", icon: UsersRound },
];

export default function AdminLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const [location] = useLocation();
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Sessão encerrada");
      window.location.href = "/";
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Não foi possível encerrar a sessão.",
      );
    }
  };

  return (
    <div className="admin-shell flex">
      <aside
        className="admin-sidebar flex flex-col flex-shrink-0"
        aria-label="Navegação administrativa"
      >
        <div className="admin-brand">
          <div>
            <p className="admin-brand__eyebrow">Área administrativa</p>
            <Link href="/admin" className="admin-brand__title">
              Painel autoral
            </Link>
          </div>
          {user?.name && (
            <p className="admin-brand__user" title={user.name}>
              {user.name}
            </p>
          )}
        </div>

        <nav className="admin-nav flex-1" aria-label="Menu administrativo">
          <ul className="list-none m-0 p-0 space-y-1">
            {navItems.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? location === href : location.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className="flex items-center gap-3 px-3 py-2.5 transition-colors"
                  >
                    <Icon size={16} aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="admin-sidebar__footer space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-site-link flex items-center gap-3 px-3 py-2.5 hover:opacity-70"
          >
            <ExternalLink size={16} aria-hidden="true" /> Ver portfólio
          </a>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="admin-logout w-full flex items-center gap-3 px-3 py-2.5 hover:opacity-70"
          >
            <LogOut size={16} aria-hidden="true" /> {loading ? "Saindo..." : "Sair"}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="admin-main-header">
          <h1>{title}</h1>
        </header>
        <main className="admin-main-content flex-1 overflow-auto" id="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
