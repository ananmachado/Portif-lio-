import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { SocialLink } from '../../types';
import { Save, Plus, Trash2, User, Globe, Phone, Mail, MapPin } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, addToast } = usePortfolio();

  const [form, setForm] = useState({ ...settings });
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(settings.social_links || []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      ...form,
      social_links: socialLinks,
    });
  };

  const handleAddSocialLink = () => {
    const newLink: SocialLink = {
      id: Math.random().toString(36).substring(2, 9),
      platform: 'Behance',
      url: 'https://',
      label: 'Novo Link',
    };
    setSocialLinks([...socialLinks, newLink]);
  };

  const handleRemoveSocialLink = (id: string) => {
    setSocialLinks(socialLinks.filter((l) => l.id !== id));
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-300">
      <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--theme-border)' }}>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--theme-primary)]" />
            <span>Informações Pessoais & Apresentação</span>
          </h2>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl font-bold text-sm text-white flex items-center gap-2 shadow-sm transition-transform hover:scale-105"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome do Portfólio */}
          <div className="space-y-1.5">
            <label htmlFor="settings-portfolio-name" className="block text-xs font-bold uppercase tracking-wider">
              Nome do Portfólio / Nome Pessoal *
            </label>
            <input
              id="settings-portfolio-name"
              type="text"
              required
              value={form.portfolio_name}
              onChange={(e) => setForm({ ...form, portfolio_name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
            />
          </div>

          {/* Tagline */}
          <div className="space-y-1.5">
            <label htmlFor="settings-tagline" className="block text-xs font-bold uppercase tracking-wider">
              Tagline / Subtítulo Curto
            </label>
            <input
              id="settings-tagline"
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              placeholder="Ex: Designer de Interfaces & Pesquisador"
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
            />
          </div>

          {/* Imagem de Perfil URL */}
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="settings-profile-image" className="block text-xs font-bold uppercase tracking-wider">
              URL da Fotografia de Perfil
            </label>
            <input
              id="settings-profile-image"
              type="url"
              value={form.profile_image}
              onChange={(e) => setForm({ ...form, profile_image: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
            />
          </div>

          {/* Biografia Curta */}
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="settings-short-bio" className="block text-xs font-bold uppercase tracking-wider">
              Resumo do Perfil (Short Bio)
            </label>
            <textarea
              id="settings-short-bio"
              rows={2}
              value={form.short_bio}
              onChange={(e) => setForm({ ...form, short_bio: e.target.value })}
              placeholder="Uma frase marcante apresentando sua visão autoral..."
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none resize-y"
              style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
            />
          </div>

          {/* Título da Seção Sobre */}
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="settings-about-title" className="block text-xs font-bold uppercase tracking-wider">
              Título da Seção Sobre
            </label>
            <input
              id="settings-about-title"
              type="text"
              value={form.about_title}
              onChange={(e) => setForm({ ...form, about_title: e.target.value })}
              placeholder="Ex: Sobre Minha Trajetória"
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
            />
          </div>

          {/* Texto Biográfico Completo */}
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="settings-about-text" className="block text-xs font-bold uppercase tracking-wider">
              Texto Biográfico Completo (Apoia parágrafos)
            </label>
            <textarea
              id="settings-about-text"
              rows={6}
              value={form.about_text}
              onChange={(e) => setForm({ ...form, about_text: e.target.value })}
              placeholder="Escreva sobre sua experiência, processos criativos, formação..."
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none resize-y"
              style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
            />
          </div>
        </div>
      </div>

      {/* Contato e Localização */}
      <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Phone className="w-5 h-5 text-[var(--theme-primary)]" />
          <span>Contato & WhatsApp</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label htmlFor="settings-whatsapp" className="block text-xs font-bold uppercase tracking-wider">
              Número do WhatsApp (com DDD) *
            </label>
            <input
              id="settings-whatsapp"
              type="text"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="Ex: 5511999999999"
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="settings-email" className="block text-xs font-bold uppercase tracking-wider">
              E-mail Público
            </label>
            <input
              id="settings-email"
              type="email"
              value={form.email_public}
              onChange={(e) => setForm({ ...form, email_public: e.target.value })}
              placeholder="contato@exemplo.com"
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="settings-location" className="block text-xs font-bold uppercase tracking-wider">
              Localização
            </label>
            <input
              id="settings-location"
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Ex: São Paulo, Brasil"
              className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
              style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
            />
          </div>
        </div>
      </div>

      {/* Redes Sociais */}
      <div className="p-6 rounded-2xl border space-y-6" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-[var(--theme-primary)]" />
            <span>Redes Sociais & Links Externos</span>
          </h2>

          <button
            type="button"
            onClick={handleAddSocialLink}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 hover:opacity-80"
            style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Link</span>
          </button>
        </div>

        <div className="space-y-3">
          {socialLinks.map((link) => (
            <div key={link.id} className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl border" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}>
              <input
                type="text"
                value={link.label}
                onChange={(e) => {
                  const updated = socialLinks.map((l) => (l.id === link.id ? { ...l, label: e.target.value } : l));
                  setSocialLinks(updated);
                }}
                placeholder="Rótulo (ex: Behance)"
                className="w-full sm:w-1/3 px-3 py-2 rounded-lg border text-xs focus:outline-none"
                style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
              />

              <input
                type="url"
                value={link.url}
                onChange={(e) => {
                  const updated = socialLinks.map((l) => (l.id === link.id ? { ...l, url: e.target.value } : l));
                  setSocialLinks(updated);
                }}
                placeholder="URL Completa (https://...)"
                className="w-full sm:w-2/3 px-3 py-2 rounded-lg border text-xs focus:outline-none"
                style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
              />

              <button
                type="button"
                onClick={() => handleRemoveSocialLink(link.id)}
                aria-label="Remover rede social"
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};
