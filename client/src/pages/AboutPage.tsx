import React from "react";
import { ExternalLink } from "lucide-react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import PublicLayout from "@/components/PublicLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useSEO } from "@/hooks/useSEO";

export default function AboutPage() {
  const { settings, isLoading } = usePortfolio();
  useSEO({ title: settings?.aboutTitle ?? "Sobre", description: settings?.shortBio ?? undefined, siteName: settings?.portfolioName });
  const monogram = (settings?.portfolioName ?? "P").slice(0, 1).toUpperCase();

  return (
    <PublicLayout>
      <section className="about-editorial" aria-labelledby="about-heading">
        <div className="container about-editorial__grid">
          {isLoading ? <Skeleton className="aspect-[.9] w-full" /> : <div className="about-portrait">{settings?.profileImageUrl ? <img src={settings.profileImageUrl} alt="Retrato de apresentação" /> : <div className="about-portrait__placeholder" aria-hidden="true">{monogram}</div>}</div>}
          <div>
            {isLoading ? <div className="space-y-4" aria-busy="true"><Skeleton className="h-5 w-28" /><Skeleton className="h-16 w-2/3" /><Skeleton className="h-28 w-full" /></div> : <>
              <p className="site-eyebrow">Quem cria</p>
              <h1 id="about-heading">{settings?.aboutTitle || "Sobre"}</h1>
              {settings?.shortBio && <p className="about-editorial__bio">{settings.shortBio}</p>}
              {settings?.location && <p className="project-story__year">Base · {settings.location}</p>}
              {settings?.aboutText && <div className="about-editorial__body">{settings.aboutText.split("\n").map((paragraph, index) => paragraph.trim() ? <p key={index}>{paragraph}</p> : null)}</div>}
              {settings?.socialLinks?.length ? <ul className="editorial-link-list" aria-label="Links externos">{settings.socialLinks.map((link) => <li key={link.url}><a href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<ExternalLink size={12} aria-hidden="true" /></a></li>)}</ul> : null}
            </>}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
