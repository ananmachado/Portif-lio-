import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Project } from '../../types';
import { Modal } from '../common/Modal';
import { FileCode, Plus, Edit3, Trash2, ArrowUp, ArrowDown, Eye, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const AdminProjects: React.FC = () => {
  const {
    projects,
    categories,
    blocks,
    updateProject,
    deleteProject,
    reorderProjects,
    setAdminSubView,
    setEditingProjectId,
  } = usePortfolio();

  const [filterStatus, setFilterStatus] = useState<'todos' | 'publicado' | 'rascunho'>('todos');
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const filteredProjects = filterStatus === 'todos'
    ? projects
    : projects.filter((p) => p.status === filterStatus);

  const handleEditProject = (id: string) => {
    setEditingProjectId(id);
    setAdminSubView('project-edit');
  };

  const handleTogglePublish = (proj: Project) => {
    const newStatus = proj.status === 'publicado' ? 'rascunho' : 'publicado';
    updateProject({ ...proj, status: newStatus });
  };

  const handleConfirmDelete = () => {
    if (deletingProject) {
      deleteProject(deletingProject.id);
      setDeletingProject(null);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const items = [...projects];
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
    reorderProjects(items);
  };

  const handleMoveDown = (index: number) => {
    if (index === projects.length - 1) return;
    const items = [...projects];
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
    reorderProjects(items);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4" style={{ borderColor: 'var(--theme-border)' }}>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileCode className="w-5 h-5 text-[var(--theme-primary)]" />
              <span>Gerenciamento de Projetos</span>
            </h2>
            <p className="text-xs text-[var(--theme-text-secondary)] mt-1">
              Cadastre, ordene, edite blocos de conteúdo e defina o status de publicação.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1 p-1 rounded-xl border text-xs" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}>
              <button
                onClick={() => setFilterStatus('todos')}
                className={`px-3 py-1 rounded-lg font-semibold ${filterStatus === 'todos' ? 'bg-white shadow-xs font-bold' : ''}`}
              >
                Todos ({projects.length})
              </button>
              <button
                onClick={() => setFilterStatus('publicado')}
                className={`px-3 py-1 rounded-lg font-semibold ${filterStatus === 'publicado' ? 'bg-white shadow-xs font-bold text-emerald-700' : ''}`}
              >
                Publicados ({projects.filter((p) => p.status === 'publicado').length})
              </button>
              <button
                onClick={() => setFilterStatus('rascunho')}
                className={`px-3 py-1 rounded-lg font-semibold ${filterStatus === 'rascunho' ? 'bg-white shadow-xs font-bold text-amber-700' : ''}`}
              >
                Rascunhos ({projects.filter((p) => p.status === 'rascunho').length})
              </button>
            </div>

            <button
              onClick={() => {
                setEditingProjectId(null);
                setAdminSubView('project-edit');
              }}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white flex items-center gap-1.5 shadow-sm"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <Plus className="w-4 h-4" />
              <span>Novo Projeto</span>
            </button>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((proj, index) => {
              const category = categories.find((c) => c.id === proj.category_id);
              const projectBlocksCount = blocks.filter((b) => b.project_id === proj.id).length;
              const isPublished = proj.status === 'publicado';

              return (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                  style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
                >
                  <div className="flex items-start gap-4">
                    {proj.cover_image && (
                      <img
                        src={proj.cover_image}
                        alt=""
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border"
                        style={{ borderColor: 'var(--theme-border)' }}
                      />
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base">{proj.title}</span>
                        {proj.year && <span className="text-xs opacity-75">({proj.year})</span>}
                      </div>

                      <p className="text-xs text-[var(--theme-text-secondary)] line-clamp-1">
                        {proj.short_description || 'Sem descrição cadastrada.'}
                      </p>

                      <div className="flex items-center gap-3 text-xs pt-1">
                        <span className="font-semibold text-[var(--theme-primary)]">
                          {category ? category.name : 'Sem Categoria'}
                        </span>
                        <span>•</span>
                        <span>{projectBlocksCount} blocos de conteúdo</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      aria-label="Mover projeto para cima"
                      className="p-2 rounded-xl border disabled:opacity-30 hover:bg-black/5"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === filteredProjects.length - 1}
                      aria-label="Mover projeto para baixo"
                      className="p-2 rounded-xl border disabled:opacity-30 hover:bg-black/5"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleTogglePublish(proj)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                        isPublished
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {isPublished ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      <span>{isPublished ? 'Publicado' : 'Rascunho'}</span>
                    </button>

                    <button
                      onClick={() => handleEditProject(proj.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5"
                      style={{
                        backgroundColor: 'var(--theme-surface)',
                        borderColor: 'var(--theme-border)',
                        color: 'var(--theme-text-primary)',
                      }}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar & Blocos</span>
                    </button>

                    <button
                      onClick={() => setDeletingProject(proj)}
                      aria-label="Excluir projeto"
                      className="p-2 rounded-xl border text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-[var(--theme-text-secondary)] py-6 text-center">
              Nenhum projeto encontrado nesta lista.
            </p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingProject)}
        onClose={() => setDeletingProject(null)}
        title="Confirmar Exclusão de Projeto"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p>
              Tem certeza que deseja excluir o projeto <strong>"{deletingProject?.title}"</strong>? Esta ação removerá permanentemente o projeto e todos os seus blocos de conteúdo.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--theme-border)' }}>
            <button
              onClick={() => setDeletingProject(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border"
              style={{ borderColor: 'var(--theme-border)' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700"
            >
              Excluir Definitivamente
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
