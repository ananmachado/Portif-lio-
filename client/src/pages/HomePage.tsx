import React from "react";
import { Link } from "wouter";
import {
  usePortfolio,
  type HomeGridConfig,
  type HomeLayoutMode,
} from "@/contexts/PortfolioContext";
import { trpc } from "@/lib/trpc";
import PublicLayout from "@/components/PublicLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useSEO } from "@/hooks/useSEO";

const DEFAULT_GRID: HomeGridConfig = {
  desktopColumns: 3,
  mobileColumns: 2,
  mode: "grid",
  gap: "medium",
};

const DEFAULT_HERO_GRID: HomeGridConfig = {
  desktopColumns: 2,
  mobileColumns: 1,
  mode: "split",
  gap: "large",
};

const DEFAULT_MANIFESTO_GRID: HomeGridConfig = {
  desktopColumns: 2,
  mobileColumns: 1,
  mode: "split",
  gap: "large",
};

const GAP_VALUES: Record<
  HomeGridConfig["gap"],
  string
> = {
  small: "1rem",
  medium: "clamp(1.2rem, 3vw, 2rem)",
  large: "clamp(2rem, 6vw, 5rem)",
};

function normalizeGrid(
  config: HomeGridConfig | undefined,
  fallback: HomeGridConfig,
): HomeGridConfig {
  return {
    ...fallback,
    ...(config ?? {}),
    desktopColumns: Math.max(
      1,
      Math.min(
        4,
        Number(
          config?.desktopColumns ??
            fallback.desktopColumns,
        ),
      ),
    ),
    mobileColumns: Math.max(
      1,
      Math.min(
        2,
        Number(
          config?.mobileColumns ??
            fallback.mobileColumns,
        ),
      ),
    ),
  };
}

function modeClass(mode: HomeLayoutMode): string {
  return `home-configurable-grid--${mode}`;
}

function gridStyle(
  config: HomeGridConfig,
): React.CSSProperties {
  return {
    "--home-desktop-cols": String(
      config.desktopColumns,
    ),
    "--home-mobile-cols": String(
      config.mobileColumns,
    ),
    "--home-grid-gap":
      GAP_VALUES[config.gap] ??
      GAP_VALUES.medium,
  } as React.CSSProperties;
}

export default function HomePage() {
  const {
    settings,
    ownerId,
    isLoading: settingsLoading,
  } = usePortfolio();

  useSEO({
    title: undefined,
    description:
      settings?.shortBio ?? undefined,
    siteName:
      settings?.portfolioName,
  });

  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = trpc.projects.listPublished.useQuery(
    { userId: ownerId },
    { enabled: ownerId > 0 },
  );

  const { data: categories } =
    trpc.categories.listPublic.useQuery(
      { userId: ownerId },
      { enabled: ownerId > 0 },
    );

  const featured =
    projects
      ?.filter((project) => project.featured)
      .slice(0, 3) ?? [];

  const displayedProjects =
    featured.length > 0
      ? featured
      : (projects ?? []).slice(0, 6);

  const name =
    settings?.portfolioName ?? "Portfólio";

  const monogram =
    name.trim().slice(0, 1).toUpperCase() ||
    "P";

  const ctaLabel =
    settings?.ctaViewProject ??
    "Ver projeto";

  const homeLayout =
    settings?.homeLayoutConfig;

  const heroLayout = normalizeGrid(
    homeLayout?.hero,
    DEFAULT_HERO_GRID,
  );

  const featuredLayout = normalizeGrid(
    homeLayout?.featured,
    DEFAULT_GRID,
  );

  const manifestoLayout = normalizeGrid(
    homeLayout?.manifesto,
    DEFAULT_MANIFESTO_GRID,
  );

  return (
    <PublicLayout>
      <style>{`
        .home-configurable-grid {
          display: grid !important;
          grid-template-columns:
            repeat(
              var(--home-desktop-cols),
              minmax(0, 1fr)
            ) !important;
          gap: var(--home-grid-gap) !important;
        }

        .home-configurable-grid--stack {
          grid-template-columns: 1fr !important;
        }

        .home-configurable-grid--asymmetric {
          grid-template-columns:
            minmax(0, 1.35fr)
            minmax(0, 0.65fr) !important;
        }

        .home-configurable-grid--reverse
          > :first-child {
          order: 2;
        }

        .home-configurable-grid--reverse
          > :last-child {
          order: 1;
        }

        .home-configurable-grid--featured-first
          > :first-child {
          grid-column: span 2;
        }

        .home-configurable-grid--masonry {
          display: block !important;
          column-count:
            var(--home-desktop-cols);
          column-gap: var(--home-grid-gap);
        }

        .home-configurable-grid--masonry > * {
          break-inside: avoid;
          display: inline-block;
          margin-bottom: var(--home-grid-gap);
          min-width: 0;
          width: 100%;
        }

        @media (max-width: 780px) {
          .home-configurable-grid {
            grid-template-columns:
              repeat(
                var(--home-mobile-cols),
                minmax(0, 1fr)
              ) !important;
          }

          .home-configurable-grid--stack,
          .home-configurable-grid--asymmetric {
            grid-template-columns: 1fr !important;
          }

          .home-configurable-grid--masonry {
            column-count:
              var(--home-mobile-cols);
          }

          .home-configurable-grid--featured-first
            > :first-child {
            grid-column: auto;
          }
        }
      `}</style>

      <section
        className="home-hero"
        aria-labelledby="hero-heading"
      >
        <div
          className={`container home-hero__grid home-configurable-grid ${modeClass(
            heroLayout.mode,
          )}`}
          style={gridStyle(heroLayout)}
        >
          <div className="home-hero__copy">
            {settingsLoading ? (
              <div
                className="space-y-4"
                aria-busy="true"
              >
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-20 w-4/5" />
              </div>
            ) : (
              <>
                <p className="site-eyebrow">
                  {settings?.homeHeroEyebrow ||
                    "Portfólio criativo"}
                </p>

                <h1 id="hero-heading">
                  {settings?.homeHeroTitle ||
                    "Ideias para ver, sentir e guardar."}
                </h1>

                <p className="home-hero__lead">
                  {settings?.homeHeroLead ||
                    "Um espaço autoral para reunir projetos, processos e histórias em movimento."}
                </p>

                <div className="hero-actions">
                  <Link
                    href="/projetos"
                    className="editorial-button"
                  >
                    {settings?.homeHeroPrimaryCta ||
                      "Conheça os projetos"}
                  </Link>

                  <Link
                    href="/contato"
                    className="editorial-button editorial-button--outline"
                  >
                    {settings?.homeHeroSecondaryCta ||
                      "Vamos conversar"}
                  </Link>
                </div>
              </>
            )}
          </div>

          <div
            className="hero-art"
            aria-label={
              settings?.profileImageUrl
                ? "Imagem de apresentação"
                : "Marca do portfólio"
            }
          >
            <span className="hero-art__label">
              feito à mão
            </span>

            {settings?.profileImageUrl ? (
              <img
                src={settings.profileImageUrl}
                alt="Foto de apresentação do portfólio"
              />
            ) : (
              <span
                className="hero-art__monogram"
                aria-hidden="true"
              >
                {monogram}
              </span>
            )}
          </div>
        </div>
      </section>

      <section
        className="editorial-section"
        aria-labelledby="featured-heading"
      >
        <div className="container">
          <div className="section-heading">
            <p className="site-eyebrow">
              {settings?.homeFeaturedEyebrow ||
                "Seleção autoral"}
            </p>

            <h2 id="featured-heading">
              {settings?.homeFeaturedTitle ||
                "Projetos em destaque"}
            </h2>

            <p>
              {settings?.homeFeaturedDescription ||
                "Uma vitrine de processos, imagens e narrativas criadas com intenção."}
            </p>
          </div>

          {projectsLoading ? (
            <div
              className="project-shelf home-configurable-grid"
              style={gridStyle(featuredLayout)}
              aria-busy="true"
            >
              {[1, 2, 3].map((index) => (
                <Skeleton
                  key={index}
                  className="aspect-square"
                />
              ))}
            </div>
          ) : projectsError ? (
            <p
              className="empty-catalog"
              role="alert"
            >
              Não foi possível carregar os projetos
              agora. Tente novamente em instantes.
            </p>
          ) : displayedProjects.length > 0 ? (
            <ul
              className={`project-shelf home-configurable-grid ${modeClass(
                featuredLayout.mode,
              )}`}
              style={gridStyle(featuredLayout)}
              aria-label="Projetos em destaque"
            >
              {displayedProjects.map((project) => {
                const category =
                  categories?.find(
                    (item) =>
                      item.id === project.categoryId,
                  );

                return (
                  <li key={project.id}>
                    <article className="project-shelf-card">
                      <Link
                        href={`/projetos/${project.slug}`}
                        className="project-thumb"
                        aria-label={`${ctaLabel}: ${project.title}`}
                      >
                        {project.coverImageUrl ? (
                          <img
                            src={project.coverImageUrl}
                            alt={
                              project.coverImageAlt ??
                              project.title
                            }
                            loading="lazy"
                          />
                        ) : (
                          <span className="project-thumb--empty">
                            {project.title
                              .slice(0, 1)
                              .toUpperCase()}
                          </span>
                        )}
                      </Link>

                      <p className="project-shelf-card__meta">
                        {category?.name ||
                          "Projeto autoral"}
                        {project.year
                          ? ` · ${project.year}`
                          : ""}
                      </p>

                      <h3>{project.title}</h3>

                      {project.shortDescription && (
                        <p className="project-shelf-card__description">
                          {project.shortDescription}
                        </p>
                      )}

                      <Link
                        href={`/projetos/${project.slug}`}
                        className="project-shelf-card__link"
                      >
                        {ctaLabel}
                      </Link>
                    </article>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p
              className="empty-catalog"
              role="status"
            >
              A vitrine está sendo preparada. Volte
              em breve para conhecer os primeiros
              projetos.
            </p>
          )}

          {displayedProjects.length > 0 && (
            <div className="section-cta">
              <Link
                href="/projetos"
                className="editorial-button editorial-button--outline"
              >
                Ver todos os projetos
              </Link>
            </div>
          )}
        </div>
      </section>

      <section
        className="home-manifesto"
        aria-labelledby="manifesto-heading"
      >
        <div
          className={`container manifesto-grid home-configurable-grid ${modeClass(
            manifestoLayout.mode,
          )}`}
          style={gridStyle(manifestoLayout)}
        >
          <div
            className="manifesto-tile"
            aria-hidden="true"
          >
            <span>
              {(
                settings?.homeManifestoTileText ||
                "criar\né cultivar"
              )
                .split("\n")
                .map((line, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <br />}
                    {line}
                  </React.Fragment>
                ))}
            </span>
          </div>

          <div className="manifesto-copy">
            <p className="site-eyebrow">
              {settings?.homeManifestoEyebrow ||
                "Sobre o processo"}
            </p>

            <h2 id="manifesto-heading">
              {settings?.homeManifestoTitle ||
                "Toda boa ideia merece ganhar forma."}
            </h2>

            <p>
              {settings?.homeManifestoText ||
                "Este portfólio reúne trabalhos e pequenos rastros do que acontece antes, durante e depois de uma ideia ganhar o mundo."}
            </p>

            <div className="mt-7">
              <Link
                href="/sobre"
                className="editorial-button"
              >
                {settings?.homeManifestoCta ||
                  "Conheça a história"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
