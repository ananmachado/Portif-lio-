import React, { useState } from "react";
import { ExternalLink } from "lucide-react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import PublicLayout from "@/components/PublicLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useSEO } from "@/hooks/useSEO";

interface FormState { name: string; subject: string; message: string; }
interface FormErrors { name?: string; subject?: string; message?: string; }

export default function ContactPage() {
  const { settings } = usePortfolio();
  useSEO({ title: "Contato", siteName: settings?.portfolioName });
  const [form, setForm] = useState<FormState>({ name: "", subject: "", message: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const ctaLabel = settings?.ctaSendMessage ?? "Enviar pelo WhatsApp";

  function validate() {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = "Por favor, informe seu nome.";
    if (!form.subject.trim()) next.subject = "Por favor, informe o assunto.";
    if (!form.message.trim()) next.message = "Por favor, escreva sua mensagem.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    const whatsapp = settings?.whatsapp?.replace(/\D/g, "") ?? "";
    if (!whatsapp) { alert("O número de WhatsApp ainda não foi configurado pelo proprietário."); return; }
    const text = `Olá! Meu nome é ${form.name}.\n\nEstou entrando em contato sobre: ${form.subject}.\n\n${form.message}`;
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  }

  return (
    <PublicLayout>
      <section className="contact-editorial" aria-labelledby="contact-heading">
        <div className="container contact-editorial__grid">
          <div className="contact-editorial__intro">
            <p className="site-eyebrow">Vamos criar juntos?</p>
            <h1 id="contact-heading">Contato</h1>
            <p>{settings?.contactIntro || "Conte um pouco sobre sua ideia. Sua mensagem será preparada e aberta diretamente no WhatsApp."}</p>
            {settings?.socialLinks?.length ? <ul className="editorial-link-list" aria-label="Redes sociais">{settings.socialLinks.map((link) => <li key={link.url}><a href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<ExternalLink size={12} aria-hidden="true" /></a></li>)}</ul> : null}
          </div>
          <div className="contact-editorial__form">
            {submitted ? <div className="contact-success" role="status"><p className="font-semibold">Mensagem preparada!</p><p className="mt-2 text-sm">O WhatsApp foi aberto com seu texto já preenchido.</p><button onClick={() => setSubmitted(false)} className="mt-5 editorial-button editorial-button--outline">Enviar outra mensagem</button></div> : (
              <form onSubmit={handleSubmit} noValidate aria-label="Formulário de contato" className="flex flex-col gap-5">
                <div><Label htmlFor="contact-name">Nome <span aria-hidden="true" style={{ color: "var(--color-error)" }}>*</span><span className="sr-only">(obrigatório)</span></Label><Input id="contact-name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} aria-required="true" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} autoComplete="name" className="mt-2" />{errors.name && <p id="name-error" role="alert" className="mt-1 text-sm" style={{ color: "var(--color-error)" }}>{errors.name}</p>}</div>
                <div><Label htmlFor="contact-subject">Assunto <span aria-hidden="true" style={{ color: "var(--color-error)" }}>*</span><span className="sr-only">(obrigatório)</span></Label><Input id="contact-subject" value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} aria-required="true" aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? "subject-error" : undefined} className="mt-2" />{errors.subject && <p id="subject-error" role="alert" className="mt-1 text-sm" style={{ color: "var(--color-error)" }}>{errors.subject}</p>}</div>
                <div><Label htmlFor="contact-message">Mensagem <span aria-hidden="true" style={{ color: "var(--color-error)" }}>*</span><span className="sr-only">(obrigatório)</span></Label><Textarea id="contact-message" value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} rows={6} aria-required="true" aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "message-error" : undefined} className="mt-2" />{errors.message && <p id="message-error" role="alert" className="mt-1 text-sm" style={{ color: "var(--color-error)" }}>{errors.message}</p>}</div>
                <Button type="submit" className="editorial-button w-full" style={{ background: "var(--color-primary)", color: "#fffaf5" }}>{ctaLabel}</Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

