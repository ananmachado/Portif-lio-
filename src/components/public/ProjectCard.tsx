import React from 'react';
import { Project, Category } from '../../types';
import { usePortfolio } from '../../context/PortfolioContext';
import { ArrowUpRight, Calendar } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  category?: Category;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, category }) => {
  const { settings, setCurrentRoute } = usePortfolio();
  const ctaText = settings.theme_config.uxVoice.ctaProject || 'Ver projeto';

  const handleClick = () => {
    setCurrentRoute({ page: 'project-detail', projectSlug: project.slug });
  };

  return (
    <article
      id={`project-card-${project.id}`}
      className="group flex flex-col justify-between rounded-2xl border transition-all duration-300 hover:-translate-y-1 overflow-hidden"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border)',
        boxShadow: 'var(--theme-shadow)',
      }}
    >
      <div>
        {/* Cover image container */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-black/5 border-b" style={{ borderColor: 'var(--theme-border)' }}>
          <img
            src={project.cover_image || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80'}
            alt={`Capa do projeto: ${project.title}`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {category && (
            <span
              className="absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-semibold backdrop-blur-md border shadow-xs"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
              }}
            >
              {category.name}
            </span>
          )}
        </div>

        {/* Card Content */}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
            {project.year && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 opacity-70" />
                {project.year}
              </span>
            )}
            {project.featured && (
              <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200">
                Destaque
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold leading-snug tracking-tight group-hover:text-[var(--theme-primary)] transition-colors">
            {project.title}
          </h3>

          <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--theme-text-secondary)' }}>
            {project.short_description}
          </p>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="p-6 pt-0 mt-2">
        <button
          onClick={handleClick}
          aria-label={`${ctaText}: ${project.title}`}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all focus:outline-none border group-hover:border-[var(--theme-primary)]"
          style={{
            backgroundColor: 'var(--theme-bg)',
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-text-primary)',
          }}
        >
          <span>{ctaText}</span>
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </article>
  );
};
