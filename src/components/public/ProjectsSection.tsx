import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { ProjectCard } from './ProjectCard';
import { Layers, FolderOpen } from 'lucide-react';

export const ProjectsSection: React.FC = () => {
  const {
    projects,
    categories,
    activeCategoryFilter,
    setActiveCategoryFilter,
    settings,
  } = usePortfolio();

  // Filter only published projects for public view
  const publishedProjects = projects.filter((p) => p.status === 'publicado');

  const filteredProjects = activeCategoryFilter === 'all'
    ? publishedProjects
    : publishedProjects.filter((p) => p.category_id === activeCategoryFilter);

  const cardColumns = settings.theme_config.layout.cardColumns;
  const gridColsClass =
    cardColumns === '1'
      ? 'grid-cols-1'
      : cardColumns === '2'
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <section id="projects-section" className="py-10 px-6 space-y-10 animate-in fade-in duration-300">
      <div className="mx-auto space-y-8" style={{ maxWidth: 'var(--theme-max-width)' }}>
        {/* Header Title */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Projetos & Trabalhos
          </h1>
          <p className="text-base md:text-lg max-w-2xl" style={{ color: 'var(--theme-text-secondary)' }}>
            Navegue pelos trabalhos selecionados por categoria ou explore todo o acervo autoral.
          </p>
        </div>

        {/* Accessible Category Filters */}
        {categories.length > 0 && (
          <div
            role="toolbar"
            aria-label="Filtro de categorias de projetos"
            className="flex flex-wrap items-center gap-2 pb-2 border-b"
            style={{ borderColor: 'var(--theme-border)' }}
            id="category-filter-toolbar"
          >
            <button
              onClick={() => setActiveCategoryFilter('all')}
              aria-pressed={activeCategoryFilter === 'all'}
              className="px-4 py-2 rounded-xl text-sm transition-all focus:outline-none flex items-center gap-2 border"
              style={{
                backgroundColor: activeCategoryFilter === 'all' ? 'var(--theme-primary)' : 'var(--theme-surface)',
                color: activeCategoryFilter === 'all' ? '#FFFFFF' : 'var(--theme-text-primary)',
                borderColor: activeCategoryFilter === 'all' ? 'var(--theme-primary)' : 'var(--theme-border)',
                fontWeight: activeCategoryFilter === 'all' ? 700 : 500,
              }}
            >
              <Layers className="w-4 h-4" />
              <span>Todos os Projetos ({publishedProjects.length})</span>
            </button>

            {categories.map((cat) => {
              const isSelected = activeCategoryFilter === cat.id;
              const count = publishedProjects.filter((p) => p.category_id === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryFilter(cat.id)}
                  aria-pressed={isSelected}
                  className="px-4 py-2 rounded-xl text-sm transition-all focus:outline-none flex items-center gap-2 border"
                  style={{
                    backgroundColor: isSelected ? 'var(--theme-primary)' : 'var(--theme-surface)',
                    color: isSelected ? '#FFFFFF' : 'var(--theme-text-primary)',
                    borderColor: isSelected ? 'var(--theme-primary)' : 'var(--theme-border)',
                    fontWeight: isSelected ? 700 : 500,
                  }}
                >
                  <span>{cat.name}</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{
                      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--theme-bg)',
                      color: isSelected ? '#FFFFFF' : 'var(--theme-text-secondary)',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className={`grid ${gridColsClass} gap-8`} id="projects-grid">
            {filteredProjects.map((project) => {
              const category = categories.find((c) => c.id === project.category_id);
              return <ProjectCard key={project.id} project={project} category={category} />;
            })}
          </div>
        ) : (
          <div
            className="p-12 rounded-2xl border text-center space-y-4 my-8"
            style={{
              backgroundColor: 'var(--theme-surface)',
              borderColor: 'var(--theme-border)',
            }}
            id="empty-projects-state"
          >
            <FolderOpen className="w-12 h-12 mx-auto opacity-40" style={{ color: 'var(--theme-text-secondary)' }} />
            <div className="space-y-1">
              <h3 className="text-lg font-bold">Nenhum projeto encontrado</h3>
              <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--theme-text-secondary)' }}>
                {settings.theme_config.uxVoice.emptyStateProjectsMessage ||
                  'Nenhum projeto foi publicado nesta categoria ainda.'}
              </p>
            </div>
            {activeCategoryFilter !== 'all' && (
              <button
                onClick={() => setActiveCategoryFilter('all')}
                className="px-4 py-2 rounded-xl text-sm font-semibold border transition-colors"
                style={{
                  backgroundColor: 'var(--theme-bg)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-primary)',
                }}
              >
                Ver todos os projetos
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
