import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { Menu, X, Shield, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const { settings, currentRoute, setCurrentRoute, isAuthenticated } = usePortfolio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const navItems = [
    { id: 'projects', label: 'Projetos' },
    { id: 'about', label: 'Sobre' },
    { id: 'contact', label: 'Contato' },
  ] as const;

  const navigateTo = (page: 'about' | 'projects' | 'contact' | 'admin') => {
    setCurrentRoute({ page });
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 w-full backdrop-blur-md transition-colors border-b"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderColor: 'var(--theme-border)',
      }}
    >
      <div
        className="mx-auto flex items-center justify-between px-6 py-4"
        style={{ maxWidth: 'var(--theme-max-width)' }}
      >
        {/* Brand / Logo */}
        <button
          onClick={() => navigateTo('projects')}
          className="flex items-center gap-2 text-left group focus:outline-none"
          id="header-brand-button"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white transition-transform group-hover:scale-105"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            {settings.portfolio_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="block font-bold text-lg tracking-tight leading-none">
              {settings.portfolio_name}
            </span>
            {settings.tagline && (
              <span
                className="block text-xs mt-1 truncate max-w-[200px] sm:max-w-xs"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                {settings.tagline}
              </span>
            )}
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1" id="desktop-nav" aria-label="Navegação principal">
          {navItems.map((item) => {
            const isActive = currentRoute.page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className="px-4 py-2 rounded-xl font-medium text-sm transition-all focus:outline-none"
                style={{
                  backgroundColor: isActive ? 'var(--theme-surface)' : 'transparent',
                  color: isActive ? 'var(--theme-primary)' : 'var(--theme-text-secondary)',
                  border: isActive ? '1px solid var(--theme-border)' : '1px solid transparent',
                  fontWeight: isActive ? 600 : 500,
                }}
              >
                {item.label}
              </button>
            );
          })}

          <div className="h-5 w-[1px] mx-2" style={{ backgroundColor: 'var(--theme-border)' }} />

          {/* Admin Entry Button */}
          <button
            onClick={() => navigateTo('admin')}
            aria-label="Área do Administrador"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all hover:opacity-80"
            style={{
              backgroundColor: currentRoute.page === 'admin' ? 'var(--theme-primary)' : 'var(--theme-surface)',
              color: currentRoute.page === 'admin' ? '#FFFFFF' : 'var(--theme-text-primary)',
              borderColor: 'var(--theme-border)',
            }}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isAuthenticated ? 'Painel Admin' : 'Admin'}</span>
          </button>
        </nav>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
          className="md:hidden p-2.5 rounded-xl border focus:outline-none transition-colors"
          style={{
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-text-primary)',
          }}
          id="mobile-menu-toggle"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden border-b shadow-xl px-6 py-6 transition-all animate-in slide-in-from-top duration-200"
          style={{
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <nav className="flex flex-col gap-3" aria-label="Navegação mobile">
            {navItems.map((item) => {
              const isActive = currentRoute.page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className="w-full text-left px-4 py-3 rounded-xl font-medium text-base transition-colors"
                  style={{
                    backgroundColor: isActive ? 'var(--theme-bg)' : 'transparent',
                    color: isActive ? 'var(--theme-primary)' : 'var(--theme-text-primary)',
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {item.label}
                </button>
              );
            })}

            <div className="my-2 border-t" style={{ borderColor: 'var(--theme-border)' }} />

            <button
              onClick={() => navigateTo('admin')}
              className="w-full text-left px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-between"
              style={{
                backgroundColor: 'var(--theme-bg)',
                color: 'var(--theme-text-primary)',
              }}
            >
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--theme-primary)]" />
                {isAuthenticated ? 'Gerenciar Portfólio (Painel)' : 'Acesso do Administrador'}
              </span>
              <Sparkles className="w-4 h-4 opacity-50" />
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};
