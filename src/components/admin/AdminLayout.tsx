import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  LayoutDashboard,
  UserCheck,
  FolderTree,
  FileCode,
  Palette,
  Database,
  LogOut,
  ExternalLink,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    adminSubView,
    setAdminSubView,
    logoutAdmin,
    settings,
    setCurrentRoute,
    setEditingProjectId,
  } = usePortfolio();

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'settings', label: 'Sobre & Dados', icon: UserCheck },
    { id: 'categories', label: 'Categorias', icon: FolderTree },
    { id: 'projects', label: 'Projetos', icon: FileCode },
    { id: 'appearance', label: 'Aparência & Tokens', icon: Palette },
    { id: 'database-setup', label: 'Banco & Supabase', icon: Database },
  ] as const;

  const handleCreateNewProject = () => {
    setEditingProjectId(null);
    setAdminSubView('project-edit');
  };

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 space-y-8 animate-in fade-in duration-300">
      <div className="mx-auto space-y-8" style={{ maxWidth: 'var(--theme-max-width)' }}>
        {/* Admin Header Bar */}
        <div
          className="p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs"
          style={{
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200">
                Área Administrativa
              </span>
              <span className="text-xs font-medium text-[var(--theme-text-secondary)]">
                {settings.portfolio_name}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1">Painel de Gerenciamento Autoral</h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCreateNewProject}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 shadow-sm transition-transform hover:scale-105"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Novo Projeto</span>
            </button>

            <button
              onClick={() => setCurrentRoute({ page: 'projects' })}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border flex items-center gap-2 hover:opacity-80 transition-colors"
              style={{
                backgroundColor: 'var(--theme-bg)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
              }}
            >
              <ExternalLink className="w-4 h-4" />
              <span>Ver Site Público</span>
            </button>

            <button
              onClick={logoutAdmin}
              aria-label="Sair da administração"
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border text-red-600 border-red-200 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav
          aria-label="Abas de gerenciamento do painel admin"
          className="flex flex-wrap items-center gap-2 border-b pb-3"
          style={{ borderColor: 'var(--theme-border)' }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = adminSubView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminSubView(tab.id as any)}
                aria-current={isActive ? 'page' : undefined}
                className="px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all focus:outline-none border"
                style={{
                  backgroundColor: isActive ? 'var(--theme-primary)' : 'var(--theme-surface)',
                  color: isActive ? '#FFFFFF' : 'var(--theme-text-primary)',
                  borderColor: isActive ? 'var(--theme-primary)' : 'var(--theme-border)',
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Tab View Content */}
        <div id="admin-view-content" className="min-h-[400px]">
          {children}
        </div>
      </div>
    </div>
  );
};
