import React from "react";
import { Link, useParams } from "wouter";
import { ArrowLeft } from "lucide-react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { trpc } from "@/lib/trpc";
import PublicLayout from "@/components/PublicLayout";
import BlockRenderer from "@/components/BlockRenderer";
import { Skeleton } from "@/components/ui/skeleton";
import { useSEO } from "@/hooks/useSEO";

export default function ProjectDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { ownerId, settings } = usePortfolio();
  const { data: project, isLoading: projectLoading, error } = trpc.projects.getBySlug.useQuery({ slug, userId: ownerId }, { enabled: Boolean(slug) && ownerId > 0 });
  const { data: categories } = trpc.categories.listPublic.useQuery({ userId: ownerId }, { enabled: ownerId > 0 });
  const { data: blocks, isLoading: blocksLoading } = trpc.blocks.listPublic.useQuery({ projectId: project?.id ?? 0 }, { enabled: Boolean(project?.id) });
  const category = categories?.find((item) => item.id === project?.categoryId);

  useSEO({ title: project?.title, description: project?.metaDescription ?? project?.shortDescription ?? undefined, ogImage: project?.coverImageUrl ?? undefined, siteName: settings?.portfolioName });

  if (projectLoading) {
    return <PublicLayout><div className="project-story"><div className="container space-y-6" aria-busy="true"><Skeleton className="h-5 w-36" /><Skeleton className="h-20 w-2/3" /><Skeleton className="h-[28rem] w-full" /></div></div></PublicLayout>;
  }

  if (error || !project) {
    return (
      <PublicLayout>
        <section className="project-story"><div className="container text-center py-16" role="alert"><p className="site-eyebrow">Projeto indisponível</p><h1 className="text-4xl mt-3">Essa página se perdeu no caminho.</h1><p className="mt-4" style={{ color: "var(--color-text-secondary)" }}>O projeto não existe, foi removido ou ainda não está publicado.</p><div className="mt-8"><Link href="/projetos" className="editorial-button">Voltar para projetos</Link></div></div></section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <article className="project-story">
        <div className="container">
          <nav aria-label="Localização atual" className="story-breadcrumb"><Link href="/projetos">Projetos</Link><span aria-hidden="true"> / </span><span aria-current="page">{project.title}</span></nav>

          <div className="project-story__hero">
            <header>
              <p className="site-eyebrow">{category?.name || "Projeto autoral"}</p>
              <h1>{project.title}</h1>
              {project.shortDescription && <p className="project-story__description">{project.shortDescription}</p>}
              {project.year && <p className="project-story__year">Ano · {project.year}</p>}
            </header>
            <div className="project-cover">
              {project.coverImageUrl ? <img src={project.coverImageUrl} alt={project.coverImageAlt ?? project.title} /> : <div className="project-thumb--empty h-full min-h-[20rem]">{project.title.slice(0, 1).toUpperCase()}</div>}
            </div>
          </div>

          <div className="project-story__content">
            {blocksLoading ? <div className="space-y-6" aria-busy="true"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div> : blocks?.length ? <BlockRenderer blocks={blocks as Parameters<typeof BlockRenderer>[0]["blocks"]} /> : <p className="empty-catalog">Este projeto ainda não tem conteúdo detalhado.</p>}
            <div className="story-back"><Link href="/projetos"><ArrowLeft size={15} aria-hidden="true" /> Voltar para projetos</Link></div>
          </div>
        </div>
      </article>
    </PublicLayout>
  );
}
