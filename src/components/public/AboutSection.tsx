import React from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { MapPin, Mail, MessageSquare, ExternalLink, Sparkles } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { settings, setCurrentRoute } = usePortfolio();

  const handleWhatsAppDirect = () => {
    if (!settings.whatsapp) return;
    const cleanNumber = settings.whatsapp.replace(/\D/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
      `Olá! Encontrei seu portfólio autoral e gostaria de conversar.`
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="about-section" className="py-12 px-6 animate-in fade-in duration-300">
      <div className="mx-auto space-y-12" style={{ maxWidth: 'var(--theme-max-width)' }}>
        {/* Main Hero Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center border-b pb-12" style={{ borderColor: 'var(--theme-border)' }}>
          {/* Profile Image */}
          {settings.profile_image && (
            <div className="md:col-span-4 flex justify-center md:justify-start">
              <div
                className="relative w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden border-2 shadow-lg"
                style={{ borderColor: 'var(--theme-border)' }}
              >
                <img
                  src={settings.profile_image}
                  alt={`Fotografia de ${settings.portfolio_name}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Intro Text */}
          <div className={`${settings.profile_image ? 'md:col-span-8' : 'md:col-span-12'} space-y-4`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border" style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)', color: 'var(--theme-primary)' }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apresentação & Biografia</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {settings.portfolio_name}
            </h1>

            {settings.tagline && (
              <p className="text-xl md:text-2xl font-medium" style={{ color: 'var(--theme-primary)' }}>
                {settings.tagline}
              </p>
            )}

            {settings.short_bio && (
              <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
                {settings.short_bio}
              </p>
            )}

            {/* Quick badges */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
              {settings.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[var(--theme-primary)]" />
                  {settings.location}
                </span>
              )}
              {settings.email_public && (
                <a
                  href={`mailto:${settings.email_public}`}
                  className="flex items-center gap-1.5 hover:underline"
                >
                  <Mail className="w-4 h-4 text-[var(--theme-primary)]" />
                  {settings.email_public}
                </a>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              {settings.whatsapp && (
                <button
                  onClick={handleWhatsAppDirect}
                  aria-label="Iniciar conversa no WhatsApp"
                  className="px-6 py-3 rounded-xl font-bold text-sm text-white flex items-center gap-2 transition-transform hover:scale-105 focus:outline-none shadow-md"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Conversar pelo WhatsApp</span>
                </button>
              )}

              <button
                onClick={() => setCurrentRoute({ page: 'contact' })}
                className="px-6 py-3 rounded-xl font-semibold text-sm border transition-colors hover:opacity-80 focus:outline-none"
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-primary)',
                }}
              >
                Enviar Mensagem
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Bio Article */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">
              {settings.about_title || 'Sobre Minha Trajetória'}
            </h2>
            <div className="space-y-4 text-base leading-relaxed" style={{ color: 'var(--theme-text-primary)' }}>
              {settings.about_text ? (
                settings.about_text.split('\n\n').map((p, i) => (
                  <p key={i} className="whitespace-pre-line">{p}</p>
                ))
              ) : (
                <p>Nenhuma biografia detalhada foi cadastrada ainda.</p>
              )}
            </div>
          </div>

          {/* Side Info Box */}
          <div className="md:col-span-4 space-y-6">
            <div
              className="p-6 rounded-2xl border space-y-4"
              style={{
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <h3 className="text-lg font-bold">Plataformas & Redes</h3>
              <div className="space-y-3 text-sm">
                {settings.social_links && settings.social_links.length > 0 ? (
                  settings.social_links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl border transition-all hover:border-[var(--theme-primary)]"
                      style={{
                        backgroundColor: 'var(--theme-bg)',
                        borderColor: 'var(--theme-border)',
                        color: 'var(--theme-text-primary)',
                      }}
                    >
                      <span className="font-semibold">{link.label || link.platform}</span>
                      <ExternalLink className="w-4 h-4 opacity-60" />
                    </a>
                  ))
                ) : (
                  <p className="text-xs text-[var(--theme-text-secondary)]">
                    Nenhuma rede social cadastrada.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
