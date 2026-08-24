import React, { useEffect, useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { normalizeThemeConfig } from '../../lib/theme';
import { Menu, X, Shield, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const { settings, currentRoute, setCurrentRoute, isAuthenticated } = usePortfolio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = normalizeThemeConfig(settings.theme_config);
  const navItems = [
    { id: 'projects', label: theme.navigation.projectsLabel },
    { id: 'about', label: theme.navigation.aboutLabel },
    { id: 'contact', label: theme.navigation.contactLabel },
  ] as const;
  useEffect(() => { const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileMenuOpen(false); if (mobileMenuOpen) window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [mobileMenuOpen]);
  const navigateTo = (page: 'about' | 'projects' | 'contact' | 'admin') => { setCurrentRoute({ page }); setMobileMenuOpen(false); };
  const logo = theme.brand.logoMode === 'name' ? settings.portfolio_name : theme.brand.logoMode === 'initial' ? settings.portfolio_name.charAt(0).toUpperCase() : '';
  const headerBackground = theme.brand.headerStyle === 'transparent' ? 'transparent' : theme.brand.headerStyle === 'solid' ? 'var(--theme-surface)' : 'color-mix(in srgb, var(--theme-surface) 86%, transparent)';
  return <header id="main-header" className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors" style={{ backgroundColor: headerBackground, borderColor: 'var(--theme-border)' }}>
    <div className="mx-auto flex items-center justify-between px-6" style={{ maxWidth: 'var(--theme-max-width)', paddingTop: 'var(--theme-header-padding)', paddingBottom: 'var(--theme-header-padding)' }}>
      <button onClick={() => navigateTo('projects')} className="flex items-center gap-3 text-left group" id="header-brand-button" aria-label={`Ir para ${settings.portfolio_name}`}>
        {logo && <div className={`flex items-center justify-center font-bold text-white shrink-0 ${theme.brand.logoMode === 'name' ? 'px-3 h-9 rounded-xl text-sm' : 'w-9 h-9 rounded-xl'}`} style={{ backgroundColor: 'var(--theme-primary)' }}>{logo}</div>}
        <div><span className="block font-bold text-lg tracking-tight leading-none">{settings.portfolio_name}</span>{theme.brand.showTagline && settings.tagline && <span className="block text-xs mt-1 truncate max-w-[220px]" style={{ color: 'var(--theme-text-secondary)' }}>{settings.tagline}</span>}</div>
      </button>
      <nav className="hidden md:flex items-center gap-1" aria-label="Navegação principal">
        {navItems.map(item => { const active = currentRoute.page === item.id; return <button key={item.id} onClick={() => navigateTo(item.id)} aria-current={active ? 'page' : undefined} className="theme-nav-link px-4 py-2 rounded-xl font-medium text-sm" style={{ backgroundColor: active ? 'var(--theme-surface)' : 'transparent', color: active ? 'var(--theme-primary)' : 'var(--theme-text-secondary)', border: active ? 'var(--theme-border-width) solid var(--theme-border)' : 'var(--theme-border-width) solid transparent', fontWeight: active ? 700 : 500 }}>{item.label}</button>; })}
        {theme.navigation.showAdminLink && <><div className="h-5 w-px mx-2" style={{ backgroundColor: 'var(--theme-border)' }} /><button onClick={() => navigateTo('admin')} aria-label="Área do Administrador" className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border" style={{ backgroundColor: currentRoute.page === 'admin' ? 'var(--theme-primary)' : 'var(--theme-surface)', color: currentRoute.page === 'admin' ? '#fff' : 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}><Shield className="w-3.5 h-3.5" /><span>{isAuthenticated ? theme.navigation.authenticatedAdminLabel : theme.navigation.adminLabel}</span></button></>}
      </nav>
      <button onClick={() => setMobileMenuOpen(v => !v)} aria-expanded={mobileMenuOpen} aria-controls="mobile-nav-drawer" aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'} className="md:hidden p-2.5 rounded-xl border" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}>{mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
    </div>
    {mobileMenuOpen && <div id="mobile-nav-drawer" className="md:hidden border-b shadow-xl px-6 py-6" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}><nav className="flex flex-col gap-3" aria-label="Navegação mobile">{navItems.map(item => { const active = currentRoute.page === item.id; return <button key={item.id} onClick={() => navigateTo(item.id)} aria-current={active ? 'page' : undefined} className="w-full text-left px-4 py-3 rounded-xl font-medium text-base" style={{ backgroundColor: active ? 'var(--theme-bg)' : 'transparent', color: active ? 'var(--theme-primary)' : 'var(--theme-text-primary)', fontWeight: active ? 700 : 500 }}>{item.label}</button>; })}{theme.navigation.showAdminLink && <><div className="my-2 border-t" style={{ borderColor: 'var(--theme-border)' }} /><button onClick={() => navigateTo('admin')} className="w-full text-left px-4 py-3 rounded-xl font-medium text-sm flex items-center justify-between" style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text-primary)' }}><span className="flex items-center gap-2"><Shield className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />{isAuthenticated ? theme.navigation.authenticatedAdminLabel : theme.navigation.adminLabel}</span><Sparkles className="w-4 h-4 opacity-50" /></button></>}</nav></div>}
  </header>;
};
