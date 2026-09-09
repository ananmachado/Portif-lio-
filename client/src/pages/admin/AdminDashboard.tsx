import React from "react";
import { Link } from "wouter";
import { Briefcase, FolderOpen, Palette, Settings, User, UsersRound, Phone, ExternalLink } from "lucide-react";
import AdminLayout from "./AdminLayout";

const cards = [
  { href: "/admin/projetos", label: "Projetos", description: "Criar, editar e organizar os projetos do portfólio.", icon: Briefcase },
  { href: "/admin/sobre", label: "Sobre", description: "Editar apresentação, biografia e informações pessoais.", icon: User },
  { href: "/admin/categorias", label: "Categorias", description: "Gerenciar as categorias usadas nos projetos.", icon: FolderOpen },
  { href: "/admin/aparencia", label: "Aparência", description: "Personalizar cores, tipografia e identidade visual.", icon: Palette },
  { href: "/admin/contato", label: "Contato", description: "Atualizar informações e canais de contato.", icon: Phone },
  { href: "/admin/configuracoes", label: "Configurações", description: "Gerenciar as configurações gerais do portfólio.", icon: Settings },
  { href: "/admin/usuarios", label: "Usuários", description: "Gerenciar usuários e permissões administrativas.", icon: UsersRound },
];

export default function AdminDashboard() {
  return (
    <AdminLayout title="Dashboard">
      <div className="max-w-5xl space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            Bem-vinda ao painel
          </h2>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Use os atalhos abaixo para administrar o conteúdo do seu portfólio.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Atalhos administrativos">
          {cards.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="block rounded-lg border p-5 transition-opacity hover:opacity-80"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
            >
              <Icon size={22} aria-hidden="true" className="mb-4" />
              <h3 className="font-semibold mb-1">{label}</h3>
              <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>{description}</p>
            </Link>
          ))}
        </section>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm hover:opacity-70"
        >
          <ExternalLink size={16} aria-hidden="true" /> Ver portfólio público
        </a>
      </div>
    </AdminLayout>
  );
}
