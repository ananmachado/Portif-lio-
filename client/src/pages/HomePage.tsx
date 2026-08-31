import React from "react";
import { Link } from "wouter";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { trpc } from "@/lib/trpc";
import PublicLayout from "@/components/PublicLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useSEO } from "@/hooks/useSEO";

export default function HomePage() {
  const { settings, ownerId, isLoading: settingsLoading } = usePortfolio();
  useSEO({ title: undefined, description: settings?.shortBio ?? undefined, siteName: settings?.portfolioName });
  const { data: projects, isLoading: projectsLoading, error: projectsError } = trpc.projects.listPublished.useQuery({ userId: ownerId }, { enabled: ownerId > 0 });
  const { data: categories } = trpc.categories.listPublic.useQuery({ userId: ownerId }, { enabled: ownerId > 0 });

  const featured = projects?.filter((project) => project.featured).slice(0, 3) ?? [];
  const displayedProjects = featured.length > 0 ? featured : (projects ?? []).slice(0, 6);
  const name = settings?.portfolioName ?? "Portfólio";
  const monogram = name.trim().slice(0, 1).toUpperCase() || "P";
  const ctaLabel = settings?.ctaViewProject ?? "Ver projeto";

  return (
    <PublicLayout>
      <section className="home-hero" aria-labelledby="hero-heading">
        <div className="container home-hero__grid">
          <div className="home-hero__copy">
            {settingsLoading ? (
              <div className="space-y-4" aria-busy="true"><Skeleton className="h-5 w-36" /><Skeleton className="h-32 w-full" /><Skeleton className="h-20 w-4/5" /></div>
            ) : (
              <>
                <p className="site-eyebrow">Portfólio criativo</p>
                <h1 id="hero-heading">{settings?.tagline || "Ideias para ver, sentir e guardar."}</h1>
                <p className="home-hero__lead">{settings?.shortBio || "Um espaço autoral para reunir projetos, processos e histórias em movimento."}</p>
                <div className="hero-actions">
                  <Link href="/projetos" className="editorial-button">Conheça os projetos</Link>
                  <Link href="/contato" className="editorial-button editorial-button--outline">Vamos conversar</Link>
                </div>
              </>
            )}
          </div>
          <div className="hero-art" aria-label={settings?.profileImageUrl ? "Imagem de apresentação" : "Marca do portfólio"}>
            <span className="hero-art__label">feito à mão</span>
            {settings?.profileImageUrl ? <img src={settings.profileImageUrl} alt="Foto de apresentação do portfólio" /> : <span className="hero-art__monogram" aria-hidden="true">{monogram}</span>}
          </div>
        </div>
      </section>

      <section className="editorial-section" aria-labelledby="featured-heading">
        <div className="container">
          <div className="section-heading">
            <p className="site-eyebrow">Seleção autoral</p>
            <h2 id="featured-heading">Projetos em destaque</h2>
            <p>Uma vitrine de processos, imagens e narrativas criadas com intenção.</p>
          </div>

          {projectsLoading ? (
            <div className="project-shelf" aria-busy="true">{[1, 2, 3].map((index) => <Skeleton key={index} className="aspect-square" />)}</div>
          ) : projectsError ? (
            <p className="empty-catalog" role="alert">Não foi possível carregar os projetos agora. Tente novamente em instantes.</p>
          ) : displayedProjects.length > 0 ? (
            <ul className="project-shelf" aria-label="Projetos em destaque">
              {displayedProjects.map((project) => {
                const category = categories?.find((item) => item.id === project.categoryId);
                return (
                  <li key={project.id}>
                    <article className="project-shelf-card">
                      <Link href={`/projetos/${project.slug}`} className="project-thumb" aria-label={`${ctaLabel}: ${project.title}`}>
                        {project.coverImageUrl ? <img src={project.coverImageUrl} alt={project.coverImageAlt ?? project.title} loading="lazy" /> : <span className="project-thumb--empty">{project.title.slice(0, 1).toUpperCase()}</span>}
                      </Link>
                      <p className="project-shelf-card__meta">{category?.name || "Projeto autoral"}{project.year ? ` · ${project.year}` : ""}</p>
                      <h3>{project.title}</h3>
                      {project.shortDescription && <p className="project-shelf-card__description">{project.shortDescription}</p>}
                      <Link href={`/projetos/${project.slug}`} className="project-shelf-card__link">{ctaLabel}</Link>
                    </article>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="empty-catalog" role="status">A vitrine está sendo preparada. Volte em breve para conhecer os primeiros projetos.</p>
          )}

          {displayedProjects.length > 0 && <div className="section-cta"><Link href="/projetos" className="editorial-button editorial-button--outline">Ver todos os projetos</Link></div>}
        </div>
      </section>

      <section className="home-manifesto" aria-labelledby="manifesto-heading">
        <div className="container manifesto-grid">
          <div className="manifesto-tile" aria-hidden="true"><span>criar<br />é cultivar</span></div>
          <div className="manifesto-copy">
            <p className="site-eyebrow">Sobre o processo</p>
            <h2 id="manifesto-heading">Toda boa ideia merece ganhar forma.</h2>
            <p>{settings?.aboutText ? settings.aboutText.split("\n").find((paragraph) => paragraph.trim()) : "Este portfólio reúne trabalhos e pequenos rastros do que acontece antes, durante e depois de uma ideia ganhar o mundo."}</p>
            <div className="mt-7"><Link href="/sobre" className="editorial-button">Conheça a história</Link></div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
