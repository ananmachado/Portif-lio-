import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { SocialLink } from '../../types';
import { Save, Plus, Trash2, User, Globe, Phone, Mail, MapPin, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { PROFILE_IMAGE_ACCEPT, PROFILE_IMAGE_MAX_BYTES, removeProfileImage, uploadProfileImage, validateProfileImage } from '../../lib/storage';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, addToast } = usePortfolio();

  const [form, setForm] = useState({ ...settings });
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(settings.social_links || []);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [profilePreview, setProfilePreview] = useState(settings.profile_image || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      ...form,
      social_links: socialLinks,
    });
  };

  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    const validationError = validateProfileImage(file);
    if (validationError) {
      addToast('error', validationError);
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setProfilePreview(localPreview);
    setIsUploadingProfile(true);

    try {
      if (!isSupabaseConfigured) {
        throw new Error('O Supabase não está configurado. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY na Vercel antes de enviar arquivos.');
      }

      const previousUrl = form.profile_image;
      const publicUrl = await uploadProfileImage(file);

      setForm((prev) => ({ ...prev, profile_image: publicUrl }));
      setProfilePreview(publicUrl);

      try {
        await updateSettings({ profile_image: publicUrl });

        // updateSettings também mantém o estado local. Esta leitura confirma que
        // o endereço realmente foi persistido no banco antes de remover a foto antiga.
        if (supabase) {
          const { data: savedSettings, error: verifyError } = await supabase
            .from('portfolio_settings')
            .select('profile_image')
            .eq('id', settings.id)
            .maybeSingle();

          if (verifyError || savedSettings?.profile_image !== publicUrl) {
            throw new Error('A foto foi enviada, mas o endereço não foi confirmado no banco de dados. Verifique as políticas RLS de portfolio_settings.');
          }
        }

        if (previousUrl && previousUrl !== publicUrl) {
          await removeProfileImage(previousUrl);
        }
        addToast('success', 'Foto de perfil enviada e salva com sucesso.');
      } catch (saveError) {
        console.error('Profile image settings save error:', saveError);
        addToast('error', saveError instanceof Error ? saveError.message : 'A foto foi enviada, mas não foi possível salvar o endereço no perfil.');
      }
    } catch (error) {
      console.error('Profile image upload error:', error);
      const message = error instanceof Error ? error.message : 'Não foi possível enviar a foto.';
      addToast('error', message);
      setProfilePreview(form.profile_image || '');
    } finally {
      URL.revokeObjectURL(localPreview);
      setIsUploadingProfile(false);
    }
  };

  const handleRemoveProfileImage = async () => {
    const currentUrl = form.profile_image;
    if (!currentUrl) return;

    setIsUploadingProfile(true);
    try {
      await removeProfileImage(currentUrl);
      setForm((prev) => ({ ...prev, profile_image: '' }));
      setProfilePreview('');
      await updateSettings({ profile_image: '' });
      addToast('success', 'Foto de perfil removida.');
    } catch (error) {
      console.error('Profile image removal error:', error);
      addToast('error', 'Não foi possível remover a foto de perfil.');
    } finally {
      setIsUploadingProfile(false);
    }
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

          {/* Imagem de Perfil — Supabase Storage */}
          <div className="space-y-4 md:col-span-2 p-5 rounded-2xl border" style={{ backgroundColor: 'var(--theme-bg)', borderColor: 'var(--theme-border)' }}>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[var(--theme-primary)]" />
                Foto de perfil
              </h3>
              <p className="text-xs mt-1" style={{ color: 'var(--theme-text-secondary)' }}>
                Envie JPG, PNG, WebP ou AVIF de até 5 MB. A imagem será armazenada no Supabase Storage.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-5 md:items-center">
              <div className="w-32 h-32 shrink-0 rounded-2xl overflow-hidden border-2 flex items-center justify-center" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                {profilePreview ? (
                  <img src={profilePreview} alt="Pré-visualização da foto de perfil" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 opacity-40" aria-hidden="true" />
                )}
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <label
                    htmlFor="settings-profile-image-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white cursor-pointer transition-opacity ${isUploadingProfile ? 'opacity-60 pointer-events-none' : 'hover:opacity-90'}`}
                    style={{ backgroundColor: 'var(--theme-primary)' }}
                  >
                    {isUploadingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {isUploadingProfile ? 'Enviando...' : 'Escolher foto'}
                  </label>
                  <input
                    id="settings-profile-image-upload"
                    type="file"
                    accept={PROFILE_IMAGE_ACCEPT}
                    onChange={handleProfileImageChange}
                    disabled={isUploadingProfile}
                    className="sr-only"
                  />

                  {form.profile_image && (
                    <button
                      type="button"
                      onClick={handleRemoveProfileImage}
                      disabled={isUploadingProfile}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border hover:opacity-80 disabled:opacity-50"
                      style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-surface)' }}
                    >
                      <X className="w-4 h-4" />
                      Remover
                    </button>
                  )}
                </div>

                <p className="text-[11px]" style={{ color: 'var(--theme-text-secondary)' }}>
                  Limite: {Math.round(PROFILE_IMAGE_MAX_BYTES / (1024 * 1024))} MB.
                  {isSupabaseConfigured ? ' O upload usa sua sessão autenticada do Supabase.' : ' O Supabase ainda não está configurado.'}
                </p>
              </div>
            </div>

            {/* Campo avançado: mantém compatibilidade com imagens externas existentes. */}
            <details>
              <summary className="cursor-pointer text-xs font-bold" style={{ color: 'var(--theme-text-secondary)' }}>
                Usar uma URL externa (opcional)
              </summary>
              <div className="mt-3">
                <label htmlFor="settings-profile-image-url" className="sr-only">URL externa da fotografia de perfil</label>
                <input
                  id="settings-profile-image-url"
                  type="url"
                  value={form.profile_image}
                  onChange={(e) => { setForm({ ...form, profile_image: e.target.value }); setProfilePreview(e.target.value); }}
                  placeholder="https://exemplo.com/minha-foto.jpg"
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none"
                  style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}
                />
              </div>
            </details>
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
