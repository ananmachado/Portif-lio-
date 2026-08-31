import React, { useState } from "react";
import { Link } from "wouter";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { trpc } from "@/lib/trpc";
import PublicLayout from "@/components/PublicLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useSEO } from "@/hooks/useSEO";

export default function ProjectsPage() {
  const { ownerId, settings } = usePortfolio();
  useSEO({ title: "Projetos", siteName: settings?.portfolioName });
  const { data: projects, isLoading: projectsLoading, error: projectsError } = trpc.projects.listPublished.useQuery({ userId: ownerId }, { enabled: ownerId > 0 });
  const { data: categories, isLoading: categoriesLoading } = trpc.categories.listPublic.useQuery({ userId: ownerId }, { enabled: ownerId > 0 });
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const ctaLabel = settings?.ctaViewProject ?? "Ver projeto";
  const displayedProjects = activeCategory === null ? (projects ?? []) : (projects ?? []).filter((project) => project.categoryId === activeCategory);

  return (
    <PublicLayout>
      <header className="editorial-page-header" aria-labelledby="projects-heading">
        <div className="container">
          <p className="site-eyebrow">Catálogo autoral</p>
          <h1 id="projects-heading">Projetos</h1>
          <p>Explore trabalhos, processos e experimentos organizados por categoria.</p>
        </div>
      </header>

      <section className="editorial-catalog" aria-label="Vitrine de projetos">
        <div className="container">
          {!categoriesLoading && categories && categories.length > 0 && (
            <nav aria-label="Filtrar projetos por categoria" className="shelf-filters">
              <button onClick={() => setActiveCategory(null)} aria-pressed={activeCategory === null}>Todos</button>
              {categories.map((category) => <button key={category.id} onClick={() => setActiveCategory(category.id)} aria-pressed={activeCategory === category.id}>{category.name}</button>)}
            </nav>
          )}

          {projectsLoading ? (
            <div className="project-shelf" aria-busy="true">{[1, 2, 3, 4, 5, 6].map((index) => <Skeleton key={index} className="aspect-square" />)}</div>
          ) : projectsError ? (
            <p className="empty-catalog" role="alert">Não foi possível carregar a vitrine de projetos. Atualize a página e tente novamente.</p>
          ) : displayedProjects.length === 0 ? (
            <p className="empty-catalog" role="status">{activeCategory !== null ? "Ainda não há projetos nesta categoria." : "Nenhum projeto publicado por enquanto."}</p>
          ) : (
            <ul className="project-shelf" aria-live="polite" aria-label="Projetos publicados">
              {displayedProjects.map((project) => {
                const category = categories?.find((item) => item.id === project.categoryId);
                return (
                  <li key={project.id}>
                    <article className="project-shelf-card">
                      <Link href={`/projetos/${project.slug}`} className="project-thumb" aria-label={`${ctaLabel}: ${project.title}`}>
                        {project.coverImageUrl ? <img src={project.coverImageUrl} alt={project.coverImageAlt ?? project.title} loading="lazy" /> : <span className="project-thumb--empty">{project.title.slice(0, 1).toUpperCase()}</span>}
                      </Link>
                      <p className="project-shelf-card__meta">{category?.name || "Projeto autoral"}{project.year ? ` · ${project.year}` : ""}</p>
                      <h2>{project.title}</h2>
                      {project.shortDescription && <p className="project-shelf-card__description">{project.shortDescription}</p>}
                      <Link href={`/projetos/${project.slug}`} className="project-shelf-card__link">{ctaLabel}</Link>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
