import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { BlockRenderer } from './BlockRenderer';
import { ArrowLeft, Calendar, Tag, AlertCircle } from 'lucide-react';

interface ProjectDetailProps {
  projectSlug?: string;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectSlug }) => {
  const { projects, categories, blocks, setCurrentRoute } = usePortfolio();

  const project = projects.find((p) => p.slug === projectSlug);
  const category = project ? categories.find((c) => c.id === project.category_id) : undefined;
  
  // Get blocks for this project, sorted by display_order
  const projectBlocks = project
    ? blocks
        .filter((b) => b.project_id === project.id)
        .sort((a, b) => a.display_order - b.display_order)
    : [];

  if (!project) {
    return (
      <div className="py-20 px-6 text-center space-y-6 max-w-xl mx-auto">
        <AlertCircle className="w-12 h-12 mx-auto text-amber-500" />
        <h1 className="text-2xl font-bold">Projeto Não Encontrado</h1>
        <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
          O projeto solicitado não foi localizado ou não está disponível publicamente.
        </p>
        <button
          onClick={() => setCurrentRoute({ page: 'projects' })}
          className="px-6 py-2.5 rounded-xl font-semibold text-sm border hover:opacity-80 transition-all"
          style={{
            backgroundColor: 'var(--theme-primary)',
            color: '#FFFFFF',
            borderColor: 'var(--theme-primary)',
          }}
        >
          Voltar para Lista de Projetos
        </button>
      </div>
    );
  }

  return (
    <article id={`project-detail-${project.id}`} className="py-10 px-6 animate-in fade-in duration-300">
      <div className="mx-auto space-y-10" style={{ maxWidth: '840px' }}>
        {/* Navigation Breadcrumb */}
        <div>
          <button
            onClick={() => setCurrentRoute({ page: 'projects' })}
            aria-label="Voltar para a lista de projetos"
            className="inline-flex items-center gap-2 text-sm font-semibold hover:underline focus:outline-none"
            style={{ color: 'var(--theme-primary)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Projetos</span>
          </button>
        </div>

        {/* Project Header Info */}
        <header className="space-y-4 border-b pb-8" style={{ borderColor: 'var(--theme-border)' }}>
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            {category && (
              <span
                className="px-3 py-1 rounded-lg border"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-primary)',
                }}
              >
                <Tag className="w-3 h-3 inline mr-1" />
                {category.name}
              </span>
            )}
            {project.year && (
              <span className="flex items-center gap-1 opacity-70" style={{ color: 'var(--theme-text-secondary)' }}>
                <Calendar className="w-3.5 h-3.5" />
                {project.year}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            {project.title}
          </h1>

          {project.short_description && (
            <p className="text-lg md:text-xl font-normal leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
              {project.short_description}
            </p>
          )}
        </header>

        {/* Cover Image */}
        {project.cover_image && (
          <figure className="rounded-2xl overflow-hidden border shadow-md" style={{ borderColor: 'var(--theme-border)' }}>
            <img
              src={project.cover_image}
              alt={`Capa principal do projeto ${project.title}`}
              className="w-full h-auto object-cover max-h-[500px]"
            />
          </figure>
        )}

        {/* Project Content Blocks */}
        <div className="space-y-8" id="project-blocks-container">
          {projectBlocks.length > 0 ? (
            projectBlocks.map((block) => (
              <BlockRenderer key={block.id} block={block} />
            ))
          ) : (
            <p className="text-sm italic py-6 text-center" style={{ color: 'var(--theme-text-secondary)' }}>
              Nenhum bloco de conteúdo adicional foi adicionado a este projeto.
            </p>
          )}
        </div>

        {/* Footer Navigation */}
        <footer className="pt-10 border-t flex items-center justify-between" style={{ borderColor: 'var(--theme-border)' }}>
          <button
            onClick={() => setCurrentRoute({ page: 'projects' })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold hover:opacity-80 transition-all"
            style={{
              backgroundColor: 'var(--theme-surface)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text-primary)',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ver Todos os Projetos</span>
          </button>
        </footer>
      </div>
    </article>
  );
};
