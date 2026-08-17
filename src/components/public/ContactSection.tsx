import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { MessageSquare, Mail, Phone, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { settings, addToast } = usePortfolio();

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    message: '',
    email: '',
  });

  const [errors, setErrors] = useState<{ name?: string; subject?: string; message?: string }>({});

  const validate = () => {
    const newErrors: { name?: string; subject?: string; message?: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Por favor, informe seu nome.';
    if (!formData.subject.trim()) newErrors.subject = 'Por favor, informe o assunto.';
    if (!formData.message.trim()) newErrors.message = 'Por favor, escreva a mensagem.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      addToast('error', 'Por favor, corrija os erros no formulário antes de enviar.');
      return;
    }

    if (!settings.whatsapp) {
      addToast('error', 'O proprietário do portfólio não cadastrou um número de WhatsApp.');
      return;
    }

    const cleanNumber = settings.whatsapp.replace(/\D/g, '');

    const messageText = `Olá! Meu nome é ${formData.name.trim()}.${
      formData.email ? ` (${formData.email})` : ''
    }\n\nEstou entrando em contato sobre: ${formData.subject.trim()}.\n\n${formData.message.trim()}`;

    const encodedMessage = encodeURIComponent(messageText);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    addToast('success', 'Redirecionando para o WhatsApp com a mensagem formatada!');
  };

  return (
    <section id="contact-section" className="py-12 px-6 animate-in fade-in duration-300">
      <div className="mx-auto space-y-10" style={{ maxWidth: '840px' }}>
        {/* Intro Header */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Contato</h1>
          <p className="text-base md:text-lg max-w-xl" style={{ color: 'var(--theme-text-secondary)' }}>
            {settings.theme_config.uxVoice.contactIntroText ||
              'Entre em contato diretamente para parcerias, orçamentos ou conversar sobre novos projetos.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Info Side Panel */}
          <div className="md:col-span-5 space-y-6">
            <div
              className="p-6 rounded-2xl border space-y-4"
              style={{
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <h3 className="text-lg font-bold">Informações Diretas</h3>

              {settings.whatsapp && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>WhatsApp</span>
                    <span className="text-sm font-bold">{settings.whatsapp}</span>
                  </div>
                </div>
              )}

              {settings.email_public && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>E-mail Público</span>
                    <a href={`mailto:${settings.email_public}`} className="text-sm font-bold hover:underline">
                      {settings.email_public}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* WhatsApp Form */}
          <div className="md:col-span-7">
            <form
              onSubmit={handleSubmitWhatsApp}
              noValidate
              id="whatsapp-contact-form"
              className="p-8 rounded-2xl border space-y-5 shadow-xs"
              style={{
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)',
              }}
            >
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Send className="w-5 h-5 text-[var(--theme-primary)]" />
                <span>Enviar Mensagem via WhatsApp</span>
              </h3>

              {/* Field: Name */}
              <div className="space-y-1.5">
                <label htmlFor="contact-name" className="block text-xs font-bold uppercase tracking-wider">
                  Seu Nome *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'error-contact-name' : undefined}
                  placeholder="Ex: Ana Silva"
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all"
                  style={{
                    backgroundColor: 'var(--theme-bg)',
                    borderColor: errors.name ? 'var(--theme-error)' : 'var(--theme-border)',
                    color: 'var(--theme-text-primary)',
                  }}
                />
                {errors.name && (
                  <p id="error-contact-name" className="text-xs font-semibold flex items-center gap-1 text-red-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Field: Subject */}
              <div className="space-y-1.5">
                <label htmlFor="contact-subject" className="block text-xs font-bold uppercase tracking-wider">
                  Assunto *
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => {
                    setFormData({ ...formData, subject: e.target.value });
                    if (errors.subject) setErrors({ ...errors, subject: undefined });
                  }}
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={errors.subject ? 'error-contact-subject' : undefined}
                  placeholder="Ex: Proposta de Projeto / Design System"
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all"
                  style={{
                    backgroundColor: 'var(--theme-bg)',
                    borderColor: errors.subject ? 'var(--theme-error)' : 'var(--theme-border)',
                    color: 'var(--theme-text-primary)',
                  }}
                />
                {errors.subject && (
                  <p id="error-contact-subject" className="text-xs font-semibold flex items-center gap-1 text-red-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.subject}</span>
                  </p>
                )}
              </div>

              {/* Field: Optional Email */}
              <div className="space-y-1.5">
                <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-wider">
                  Seu E-mail <span className="text-xs font-normal opacity-70">(Opcional)</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seuemail@exemplo.com"
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all"
                  style={{
                    backgroundColor: 'var(--theme-bg)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text-primary)',
                  }}
                />
              </div>

              {/* Field: Message */}
              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="block text-xs font-bold uppercase tracking-wider">
                  Mensagem *
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    if (errors.message) setErrors({ ...errors, message: undefined });
                  }}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'error-contact-message' : undefined}
                  placeholder="Escreva os detalhes da sua mensagem..."
                  className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-all resize-y"
                  style={{
                    backgroundColor: 'var(--theme-bg)',
                    borderColor: errors.message ? 'var(--theme-error)' : 'var(--theme-border)',
                    color: 'var(--theme-text-primary)',
                  }}
                />
                {errors.message && (
                  <p id="error-contact-message" className="text-xs font-semibold flex items-center gap-1 text-red-600">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.message}</span>
                  </p>
                )}
              </div>

              {/* Action Button */}
              <button
                type="submit"
                id="submit-whatsapp-button"
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] shadow-md focus:outline-none"
                style={{ backgroundColor: '#25D366' }}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Enviar pelo WhatsApp</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
