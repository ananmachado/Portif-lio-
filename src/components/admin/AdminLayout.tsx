import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { LayoutDashboard, UserCheck, FolderTree, FileCode, Palette, Database, LogOut, ExternalLink, PlusCircle, Menu, X } from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { adminSubView, setAdminSubView, logoutAdmin, settings, setCurrentRoute, setEditingProjectId } = usePortfolio();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const tabs = [
    { id:'overview', label:'Visão geral', icon:LayoutDashboard },
    { id:'settings', label:'Conteúdo', icon:UserCheck },
    { id:'categories', label:'Categorias', icon:FolderTree },
    { id:'projects', label:'Projetos', icon:FileCode },
    { id:'appearance', label:'Aparência', icon:Palette },
    { id:'database-setup', label:'Banco de dados', icon:Database },
  ] as const;
  const open = (id: typeof tabs[number]['id']) => { setAdminSubView(id); setMobileOpen(false); };
  const newProject = () => { setEditingProjectId(null); setAdminSubView('project-edit'); setMobileOpen(false); };
  return <div className="min-h-screen px-4 py-4 md:px-6 md:py-6" style={{ backgroundColor:'var(--theme-bg)' }}>
    <div className="mx-auto flex max-w-[1500px] gap-6" style={{ minHeight:'calc(100vh - 48px)' }}>
      <aside className="hidden lg:flex w-64 shrink-0 flex-col rounded-3xl border p-4 sticky top-6 h-[calc(100vh-48px)]" style={{ backgroundColor:'var(--theme-surface)', borderColor:'var(--theme-border)', boxShadow:'var(--theme-shadow)' }} aria-label="Navegação administrativa">
        <div className="px-3 py-3 mb-4"><div className="text-xs font-bold uppercase tracking-[.18em]" style={{ color:'var(--theme-primary)' }}>Admin</div><div className="font-bold text-lg mt-1 truncate">{settings.portfolio_name}</div><div className="text-xs mt-1" style={{ color:'var(--theme-text-secondary)' }}>Central de controle visual</div></div>
        <button onClick={newProject} className="theme-button w-full px-4 py-3 text-sm font-bold text-white flex items-center justify-center gap-2 mb-5" style={{ backgroundColor:'var(--theme-primary)' }}><PlusCircle className="w-4 h-4"/>Novo projeto</button>
        <nav className="space-y-1 flex-1">{tabs.map(tab=>{const Icon=tab.icon; const active=adminSubView===tab.id; return <button key={tab.id} onClick={()=>open(tab.id)} aria-current={active?'page':undefined} className="w-full px-3 py-2.5 rounded-xl text-left text-sm flex items-center gap-3" style={{ backgroundColor:active?'color-mix(in srgb, var(--theme-primary) 10%, transparent)':'transparent', color:active?'var(--theme-primary)':'var(--theme-text-primary)', fontWeight:active?700:500 }}><Icon className="w-4 h-4"/>{tab.label}</button>})}</nav>
        <div className="border-t pt-4 space-y-1" style={{ borderColor:'var(--theme-border)' }}><button onClick={()=>setCurrentRoute({page:'projects'})} className="w-full px-3 py-2.5 rounded-xl text-left text-sm flex items-center gap-3" style={{ color:'var(--theme-text-secondary)' }}><ExternalLink className="w-4 h-4"/>Ver site público</button><button onClick={logoutAdmin} className="w-full px-3 py-2.5 rounded-xl text-left text-sm flex items-center gap-3 text-red-600"><LogOut className="w-4 h-4"/>Sair</button></div>
      </aside>
      <main className="min-w-0 flex-1">
        <div className="lg:hidden mb-4 rounded-2xl border p-4 flex items-center justify-between" style={{ backgroundColor:'var(--theme-surface)', borderColor:'var(--theme-border)' }}><div><div className="text-xs font-bold uppercase tracking-widest" style={{ color:'var(--theme-primary)' }}>Admin</div><div className="font-bold">{settings.portfolio_name}</div></div><button onClick={()=>setMobileOpen(v=>!v)} aria-expanded={mobileOpen} aria-label="Abrir menu administrativo" className="p-2 rounded-xl border" style={{ borderColor:'var(--theme-border)' }}>{mobileOpen?<X/>:<Menu/>}</button></div>
        {mobileOpen && <div className="lg:hidden mb-4 rounded-2xl border p-3 space-y-1" style={{ backgroundColor:'var(--theme-surface)', borderColor:'var(--theme-border)' }}>{tabs.map(tab=>{const Icon=tab.icon; const active=adminSubView===tab.id; return <button key={tab.id} onClick={()=>open(tab.id)} className="w-full px-3 py-3 rounded-xl text-left text-sm flex items-center gap-3" style={{ backgroundColor:active?'color-mix(in srgb, var(--theme-primary) 10%, transparent)':'transparent', color:active?'var(--theme-primary)':'var(--theme-text-primary)', fontWeight:active?700:500 }}><Icon className="w-4 h-4"/>{tab.label}</button>})}<button onClick={newProject} className="theme-button w-full mt-2 px-3 py-3 text-sm font-bold text-white flex items-center justify-center gap-2" style={{backgroundColor:'var(--theme-primary)'}}><PlusCircle className="w-4 h-4"/>Novo projeto</button></div>}
        <div className="rounded-3xl border p-5 md:p-7" style={{ backgroundColor:'var(--theme-surface)', borderColor:'var(--theme-border)' }}><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7"><div><div className="text-xs font-bold uppercase tracking-widest" style={{ color:'var(--theme-primary)' }}>Painel</div><h1 className="text-2xl md:text-3xl font-bold mt-1">Controle do portfólio</h1><p className="text-sm mt-1" style={{ color:'var(--theme-text-secondary)' }}>Aqui você controla conteúdo, identidade visual, navegação e acessibilidade.</p></div><div className="flex gap-2"><button onClick={()=>setCurrentRoute({page:'projects'})} className="theme-button px-3 py-2 text-sm font-semibold border flex items-center gap-2" style={{ borderColor:'var(--theme-border)', color:'var(--theme-text-primary)', backgroundColor:'var(--theme-bg)' }}><ExternalLink className="w-4 h-4"/>Ver site</button><button onClick={logoutAdmin} aria-label="Sair" className="theme-button px-3 py-2 border text-red-600" style={{borderColor:'var(--theme-border)'}}><LogOut className="w-4 h-4"/></button></div></div><div id="admin-view-content" className="min-h-[400px]">{children}</div></div>
      </main>
    </div>
  </div>;
};
