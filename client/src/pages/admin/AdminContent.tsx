import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { ThemeConfig } from "../../../drizzle/schema";

type ContentForm = Pick<ThemeConfig,
  | "siteRibbon" | "homeEyebrow" | "homeProjectsButton" | "homeContactButton"
  | "homeFeaturedEyebrow" | "homeFeaturedTitle" | "homeFeaturedDescription"
  | "homeManifestoEyebrow" | "homeManifestoTitle" | "homeManifestoButton"
  | "projectsEyebrow" | "projectsTitle" | "projectsDescription" | "projectsAllFilter"
  | "aboutEyebrow" | "contactEyebrow" | "contactTitle" | "contactDefaultIntro"
  | "contactSubmittedTitle" | "contactSubmittedDescription" | "contactResendButton"
  | "contactNameLabel" | "contactSubjectLabel" | "contactMessageLabel"
  | "footerNavigationLabel" | "footerFindLabel" | "footerBottom"
>;

const defaults: ContentForm = {
  siteRibbon: "Portfólio autoral · ideias, imagens e histórias",
  homeEyebrow: "Portfólio criativo",
  homeProjectsButton: "Conheça os projetos",
  homeContactButton: "Vamos conversar",
  homeFeaturedEyebrow: "Seleção autoral",
  homeFeaturedTitle: "Projetos em destaque",
  homeFeaturedDescription: "Uma vitrine de processos, imagens e narrativas criadas com intenção.",
  homeManifestoEyebrow: "Sobre o processo",
  homeManifestoTitle: "Toda boa ideia merece ganhar forma.",
  homeManifestoButton: "Conheça a história",
  projectsEyebrow: "Catálogo autoral",
  projectsTitle: "Projetos",
  projectsDescription: "Explore trabalhos, processos e experimentos organizados por categoria.",
  projectsAllFilter: "Todos",
  aboutEyebrow: "Quem cria",
  contactEyebrow: "Vamos criar juntos?",
  contactTitle: "Contato",
  contactDefaultIntro: "Conte um pouco sobre sua ideia. Sua mensagem será preparada e aberta diretamente no WhatsApp.",
  contactSubmittedTitle: "Mensagem preparada!",
  contactSubmittedDescription: "O WhatsApp foi aberto com seu texto já preenchido.",
  contactResendButton: "Enviar outra mensagem",
  contactNameLabel: "Nome",
  contactSubjectLabel: "Assunto",
  contactMessageLabel: "Mensagem",
  footerNavigationLabel: "Navegação",
  footerFindLabel: "Encontrar",
  footerBottom: "Feito para guardar boas ideias.",
};

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean }) {
  return (
    <div>
      <Label>{label}</Label>
      {multiline ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="mt-1" />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1" />
      )}
    </div>
  );
}

export default function AdminContent() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => { toast.success("Conteúdo do site salvo!"); utils.settings.get.invalidate(); utils.settings.getPublicPortfolio.invalidate(); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });
  const [form, setForm] = useState<ContentForm>(defaults);

  useEffect(() => {
    if (settings) {
      const cfg = (settings.themeConfig ?? {}) as ThemeConfig;
      setForm(Object.fromEntries(Object.keys(defaults).map((key) => [key, cfg[key as keyof ContentForm] ?? defaults[key as keyof ContentForm]])) as ContentForm);
    }
  }, [settings]);

  const set = (key: keyof ContentForm) => (value: string) => setForm((current) => ({ ...current, [key]: value }));

  function save() {
    const existing = (settings?.themeConfig ?? {}) as Record<string, string>;
    updateMutation.mutate({ themeConfig: { ...existing, ...form } });
  }

  if (isLoading) return <AdminLayout title="Conteúdo do site"><Loader2 className="animate-spin" /></AdminLayout>;

  return (
    <AdminLayout title="Conteúdo do site">
      <div className="max-w-3xl space-y-10">
        <section className="space-y-5">
          <div><h2 className="text-xl font-semibold">Cabeçalho e rodapé</h2><p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>Textos que aparecem em várias páginas.</p></div>
          <Field label="Faixa superior" value={form.siteRibbon ?? ""} onChange={set("siteRibbon")} />
          <Field label="Título da navegação no rodapé" value={form.footerNavigationLabel ?? ""} onChange={set("footerNavigationLabel")} />
          <Field label="Título da área de contato no rodapé" value={form.footerFindLabel ?? ""} onChange={set("footerFindLabel")} />
          <Field label="Texto final do rodapé" value={form.footerBottom ?? ""} onChange={set("footerBottom")} />
        </section>

        <section className="space-y-5">
          <div><h2 className="text-xl font-semibold">Página inicial</h2><p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>Edite os textos das três áreas principais da Home.</p></div>
          <Field label="Texto pequeno do destaque principal" value={form.homeEyebrow ?? ""} onChange={set("homeEyebrow")} />
          <Field label="Botão para projetos" value={form.homeProjectsButton ?? ""} onChange={set("homeProjectsButton")} />
          <Field label="Botão para contato" value={form.homeContactButton ?? ""} onChange={set("homeContactButton")} />
          <Field label="Texto pequeno dos projetos" value={form.homeFeaturedEyebrow ?? ""} onChange={set("homeFeaturedEyebrow")} />
          <Field label="Título dos projetos" value={form.homeFeaturedTitle ?? ""} onChange={set("homeFeaturedTitle")} />
          <Field label="Descrição dos projetos" value={form.homeFeaturedDescription ?? ""} onChange={set("homeFeaturedDescription")} multiline />
          <Field label="Texto pequeno do manifesto" value={form.homeManifestoEyebrow ?? ""} onChange={set("homeManifestoEyebrow")} />
          <Field label="Título do manifesto" value={form.homeManifestoTitle ?? ""} onChange={set("homeManifestoTitle")} multiline />
          <Field label="Botão do manifesto" value={form.homeManifestoButton ?? ""} onChange={set("homeManifestoButton")} />
        </section>

        <section className="space-y-5">
          <div><h2 className="text-xl font-semibold">Página Projetos</h2><p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>O filtro por categoria e subtópico continua separado e não é alterado.</p></div>
          <Field label="Texto pequeno" value={form.projectsEyebrow ?? ""} onChange={set("projectsEyebrow")} />
          <Field label="Título" value={form.projectsTitle ?? ""} onChange={set("projectsTitle")} />
          <Field label="Descrição" value={form.projectsDescription ?? ""} onChange={set("projectsDescription")} multiline />
          <Field label="Filtro 'Todos'" value={form.projectsAllFilter ?? ""} onChange={set("projectsAllFilter")} />
        </section>

        <section className="space-y-5">
          <div><h2 className="text-xl font-semibold">Página Sobre</h2></div>
          <Field label="Texto pequeno" value={form.aboutEyebrow ?? ""} onChange={set("aboutEyebrow")} />
        </section>

        <section className="space-y-5">
          <div><h2 className="text-xl font-semibold">Página Contato</h2><p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>O texto introdutório cadastrado em Contato continua tendo prioridade.</p></div>
          <Field label="Texto pequeno" value={form.contactEyebrow ?? ""} onChange={set("contactEyebrow")} />
          <Field label="Título" value={form.contactTitle ?? ""} onChange={set("contactTitle")} />
          <Field label="Texto padrão da introdução" value={form.contactDefaultIntro ?? ""} onChange={set("contactDefaultIntro")} multiline />
          <Field label="Título após envio" value={form.contactSubmittedTitle ?? ""} onChange={set("contactSubmittedTitle")} />
          <Field label="Texto após envio" value={form.contactSubmittedDescription ?? ""} onChange={set("contactSubmittedDescription")} multiline />
          <Field label="Botão para enviar outra mensagem" value={form.contactResendButton ?? ""} onChange={set("contactResendButton")} />
          <Field label="Campo Nome" value={form.contactNameLabel ?? ""} onChange={set("contactNameLabel")} />
          <Field label="Campo Assunto" value={form.contactSubjectLabel ?? ""} onChange={set("contactSubjectLabel")} />
          <Field label="Campo Mensagem" value={form.contactMessageLabel ?? ""} onChange={set("contactMessageLabel")} />
        </section>

        <Button onClick={save} disabled={updateMutation.isPending} style={{ background: "var(--color-primary)", color: "#fff" }}>
          {updateMutation.isPending ? <><Loader2 className="animate-spin mr-2" size={16} />Salvando...</> : "Salvar alterações"}
        </Button>
      </div>
    </AdminLayout>
  );
}
