import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings } = usePortfolio();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="main-footer"
      className="w-full mt-20 border-t py-12 px-6 transition-colors"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderColor: 'var(--theme-border)',
        color: 'var(--theme-text-secondary)',
      }}
    >
      <div
        className="mx-auto flex flex-col md:flex-row items-center justify-between gap-6"
        style={{ maxWidth: 'var(--theme-max-width)' }}
      >
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--theme-text-primary)' }}>
            {settings.portfolio_name}
          </p>
          <p className="text-xs mt-1">
            © {new Date().getFullYear()} — Todos os direitos reservados. Portfólio Autoral.
          </p>
        </div>

        {/* Social Links */}
        {settings.social_links && settings.social_links.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium" aria-label="Redes sociais e links externos">
            {settings.social_links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline transition-all"
                style={{ color: 'var(--theme-primary)' }}
              >
                {link.label || link.platform}
              </a>
            ))}
          </div>
        )}

        {/* Back to top button */}
        <button
          onClick={scrollToTop}
          aria-label="Voltar ao topo da página"
          className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border hover:opacity-80 transition-all focus:outline-none"
          style={{
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-text-primary)',
            backgroundColor: 'var(--theme-bg)',
          }}
        >
          <span>Topo</span>
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};
