import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { FileCode, FolderTree, Palette, Eye, PlusCircle, CheckCircle, Clock } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { projects, categories, blocks, setAdminSubView, setEditingProjectId, updateProject } = usePortfolio();

  const totalProjects = projects.length;
  const publishedProjects = projects.filter((p) => p.status === 'publicado').length;
  const draftProjects = projects.filter((p) => p.status === 'rascunho').length;

  const handleEditProject = (id: string) => {
    setEditingProjectId(id);
    setAdminSubView('project-edit');
  };

  const handleToggleStatus = (proj: typeof projects[0]) => {
    const newStatus = proj.status === 'publicado' ? 'rascunho' : 'publicado';
    updateProject({ ...proj, status: newStatus });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">
            <span>Total de Projetos</span>
            <FileCode className="w-5 h-5 text-[var(--theme-primary)]" />
          </div>
          <p className="text-3xl font-extrabold">{totalProjects}</p>
        </div>

        <div className="p-6 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">
            <span>Publicados</span>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600">{publishedProjects}</p>
        </div>

        <div className="p-6 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">
            <span>Rascunhos</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-amber-600">{draftProjects}</p>
        </div>

        <div className="p-6 rounded-2xl border space-y-2" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[var(--theme-text-secondary)]">
            <span>Categorias</span>
            <FolderTree className="w-5 h-5 text-[var(--theme-primary)]" />
          </div>
          <p className="text-3xl font-extrabold">{categories.length}</p>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <h3 className="text-lg font-bold">Ações Rápidas</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => {
              setEditingProjectId(null);
              setAdminSubView('project-edit');
            }}
            className="px-4 py-2.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 shadow-sm"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Criar Novo Projeto</span>
          </button>

          <button
            onClick={() => setAdminSubView('appearance')}
            className="px-4 py-2.5 rounded-xl font-semibold text-sm border flex items-center gap-2"
            style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}
          >
            <Palette className="w-4 h-4" />
            <span>Aparência & Tokens</span>
          </button>

          <button
            onClick={() => setAdminSubView('categories')}
            className="px-4 py-2.5 rounded-xl font-semibold text-sm border flex items-center gap-2"
            style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}
          >
            <FolderTree className="w-4 h-4" />
            <span>Gerenciar Categorias</span>
          </button>
        </div>
      </div>

      {/* Recent Projects List */}
      <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Projetos Cadastrados</h3>
          <button
            onClick={() => setAdminSubView('projects')}
            className="text-xs font-bold text-[var(--theme-primary)] hover:underline"
          >
            Ver todos ({projects.length})
          </button>
        </div>

        {projects.length > 0 ? (
          <div className="space-y-3">
            {projects.slice(0, 5).map((p) => {
              const cat = categories.find((c) => c.id === p.category_id);
              const isPublished = p.status === 'publicado';

              return (
                <div
                  key={p.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border gap-4"
                  style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
                >
                  <div className="flex items-center gap-3">
                    {p.cover_image && (
                      <img
                        src={p.cover_image}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border"
                        style={{ borderColor: 'var(--theme-border)' }}
                      />
                    )}
                    <div>
                      <p className="font-bold text-sm">{p.title}</p>
                      <p className="text-xs text-[var(--theme-text-secondary)]">
                        {cat ? cat.name : 'Sem categoria'} • {p.year || 'Ano não informado'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleStatus(p)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                        isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {isPublished ? 'Publicado' : 'Rascunho'}
                    </button>

                    <button
                      onClick={() => handleEditProject(p.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                      style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
                    >
                      Editar Blocos
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[var(--theme-text-secondary)] py-4">Nenhum projeto cadastrado.</p>
        )}
      </div>
    </div>
  );
};
