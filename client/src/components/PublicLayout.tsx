import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useAuth } from "@/_core/hooks/useAuth";

const navLinks = [
  { href: "/", label: "Início" },
  { href: "/projetos", label: "Projetos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { settings } = usePortfolio();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  const portfolioName = settings?.portfolioName ?? "Portfólio";
  const adminHref = user?.role === "admin" ? "/admin" : "/admin-login";
  const adminLabel = user?.role === "admin" ? "Painel" : "Admin";

  useEffect(() => { setMenuOpen(false); }, [location]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [menuOpen]);
  useEffect(() => {
    if (menuOpen) menuRef.current?.querySelector<HTMLElement>("a, button")?.focus();
  }, [menuOpen]);

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">Pular para o conteúdo principal</a>
      <div className="site-ribbon" aria-hidden="true">Portfólio autoral · ideias, imagens e histórias</div>

      <header className="editorial-header">
        <div className="container editorial-header__inner">
          <Link href="/" className="wordmark" aria-label={`${portfolioName} — página inicial`}>
            {portfolioName}
          </Link>

          <nav aria-label="Navegação principal" className="editorial-nav">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} aria-current={location === href ? "page" : undefined}>{label}</Link>
            ))}
          </nav>

          <div className="header-actions" aria-label="Acesso administrativo">
            <Link href={adminHref} className="header-action header-action--admin">{adminLabel}</Link>
          </div>

          <button
            ref={menuBtnRef}
            className="mobile-menu-toggle"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>

        {menuOpen && (
          <div id="mobile-menu" ref={menuRef} role="dialog" aria-modal="true" aria-label="Menu de navegação" className="mobile-nav">
            <nav aria-label="Navegação mobile" className="container">
              {navLinks.map(({ href, label }) => (
                <Link key={href} href={href} aria-current={location === href ? "page" : undefined} onClick={() => setMenuOpen(false)}>{label}</Link>
              ))}
              <Link href={adminHref} onClick={() => setMenuOpen(false)}>{adminLabel}</Link>
            </nav>
          </div>
        )}
      </header>

      <main id="main-content" tabIndex={-1} className="outline-none flex-1">{children}</main>

      <footer className="site-footer">
        <div className="container">
          <div className="site-footer__grid">
            <div>
              <span className="wordmark">{portfolioName}</span>
              <h2>{settings?.tagline || "Há coisas que só você pode criar."}</h2>
            </div>
            <div>
              <p className="footer-kicker">Navegação</p>
              <ul className="footer-links mt-3">
                {navLinks.map(({ href, label }) => <li key={href}><Link href={href}>{label}</Link></li>)}
              </ul>
            </div>
            <div>
              <p className="footer-kicker">Encontrar</p>
              <ul className="footer-links mt-3">
                {settings?.emailPublic && <li><a href={`mailto:${settings.emailPublic}`}>{settings.emailPublic}</a></li>}
                {settings?.socialLinks?.map((link) => <li key={link.url}><a href={link.url} target="_blank" rel="noopener noreferrer">{link.label}</a></li>)}
                <li><Link href={adminHref}>{user?.role === "admin" ? "Painel administrativo" : "Acesso administrativo"}</Link></li>
              </ul>
            </div>
          </div>
          <p className="footer-bottom">© {new Date().getFullYear()} {portfolioName}. Feito para guardar boas ideias.</p>
        </div>
      </footer>
    </div>
  );
}
