import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import type { ThemeConfig } from "../../../../drizzle/schema";

const DEFAULT_THEME: ThemeConfig = {
  colorBackground: "#f8d9df",
  colorSurface: "#fffaf5",
  colorTextPrimary: "#651b37",
  colorTextSecondary: "#7d3850",
  colorPrimary: "#842345",
  colorSecondary: "#af5870",
  colorAccent: "#436443",
  colorBorder: "#dca7b4",
  colorFocus: "#176a82",
  fontHeading: "DM Serif Display",
  fontBody: "Inter",
  fontSizeBase: "1rem",
  lineHeightBase: "1.65",
  letterSpacingHeading: "-0.022em",
  radiusNone: "0",
  radiusSm: "0.125rem",
  radiusMd: "0.25rem",
  radiusLg: "0.5rem",
  radiusFull: "9999px",
  borderWidth: "1px",
  shadowSm: "0 2px 0 rgb(114 28 58 / 9%)",
  shadowMd: "0 7px 0 rgb(114 28 58 / 10%)",
  shadowLg: "0 16px 0 rgb(114 28 58 / 10%)",
  maxWidth: "76rem",
  gapBase: "1.5rem",
  motionFast: "120ms",
  motionNormal: "220ms",
  motionSlow: "400ms",
  motionEasing: "cubic-bezier(0.23, 1, 0.32, 1)",
  ctaViewProject: "Ver projeto",
  ctaSendMessage: "Enviar pelo WhatsApp",
};

function TokenField({ label, tokenKey, value, onChange, hint }: { label: string; tokenKey: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div>
      <Label htmlFor={`token-${tokenKey}`}>{label}</Label>
      {hint && <p className="text-xs mt-0.5 mb-1" style={{ color: "var(--color-text-secondary)" }}>{hint}</p>}
      <Input id={`token-${tokenKey}`} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 font-mono text-sm" />
    </div>
  );
}

export default function AdminAppearance() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => { toast.success("Aparência salva e aplicada!"); utils.settings.get.invalidate(); utils.settings.getPublic.invalidate(); },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [previewing, setPreviewing] = useState(false);

  useEffect(() => {
    if (settings?.themeConfig) {
      setTheme({ ...DEFAULT_THEME, ...(settings.themeConfig as ThemeConfig) });
    }
  }, [settings]);

  function setToken(key: keyof ThemeConfig, value: string) {
    const updated = { ...theme, [key]: value };
    setTheme(updated);
    // Live preview: apply immediately to CSS custom properties
    const propMap: Record<string, string> = {
      colorBackground: "--color-background",
      colorSurface: "--color-surface",
      colorTextPrimary: "--color-text-primary",
      colorTextSecondary: "--color-text-secondary",
      colorPrimary: "--color-primary",
      colorSecondary: "--color-secondary",
      colorAccent: "--color-accent",
      colorBorder: "--color-border",
      colorFocus: "--color-focus",
      radiusNone: "--radius-none",
      radiusSm: "--radius-sm",
      radiusMd: "--radius-md",
      radiusLg: "--radius-lg",
      radiusFull: "--radius-full",
      shadowSm: "--shadow-sm",
      shadowMd: "--shadow-md",
      shadowLg: "--shadow-lg",
      maxWidth: "--max-width",
      gapBase: "--gap-base",
      motionFast: "--motion-fast",
      motionNormal: "--motion-normal",
      motionSlow: "--motion-slow",
      motionEasing: "--motion-easing",
    };
    const cssProp = propMap[key as string];
    if (cssProp && value) document.documentElement.style.setProperty(cssProp, value);
    if (key === "fontBody" && value) document.body.style.fontFamily = `${value}, var(--font-sans)`;
  }

  // Apply preview to CSS custom properties without saving
  function applyPreview() {
    const root = document.documentElement;
    const map: Record<string, string | undefined> = {
      "--color-background": theme.colorBackground,
      "--color-surface": theme.colorSurface,
      "--color-text-primary": theme.colorTextPrimary,
      "--color-text-secondary": theme.colorTextSecondary,
      "--color-primary": theme.colorPrimary,
      "--color-secondary": theme.colorSecondary,
      "--color-accent": theme.colorAccent,
      "--color-border": theme.colorBorder,
      "--color-focus": theme.colorFocus,
      "--radius-none": theme.radiusNone,
      "--radius-sm": theme.radiusSm,
      "--radius-md": theme.radiusMd,
      "--radius-lg": theme.radiusLg,
      "--radius-full": theme.radiusFull,
      "--shadow-sm": theme.shadowSm,
      "--shadow-md": theme.shadowMd,
      "--shadow-lg": theme.shadowLg,
      "--max-width": theme.maxWidth,
      "--gap-base": theme.gapBase,
      "--motion-fast": theme.motionFast,
      "--motion-normal": theme.motionNormal,
      "--motion-slow": theme.motionSlow,
      "--motion-easing": theme.motionEasing,
    };
    for (const [prop, val] of Object.entries(map)) {
      if (val) root.style.setProperty(prop, val);
    }
    if (theme.fontBody) document.body.style.fontFamily = `${theme.fontBody}, var(--font-sans)`;
    setPreviewing(true);
    toast.info("Preview aplicado. Clique em Salvar para persistir.");
  }

  function handleSave() {
    updateMutation.mutate({ themeConfig: theme as Record<string, string> });
  }

  if (isLoading) return <AdminLayout title="Aparência"><Loader2 className="animate-spin" /></AdminLayout>;

  return (
    <AdminLayout title="Aparência">
      <div className="max-w-2xl">
        <p className="mb-6 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Configure os tokens visuais do portfólio. Clique em <strong>Preview</strong> para ver as alterações antes de salvar.
        </p>
        <Tabs defaultValue="cores">
          <TabsList className="mb-6">
            <TabsTrigger value="cores">Cores</TabsTrigger>
            <TabsTrigger value="tipografia">Tipografia</TabsTrigger>
            <TabsTrigger value="forma">Forma</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="movimento">Movimento</TabsTrigger>
            <TabsTrigger value="linguagem">Linguagem</TabsTrigger>
          </TabsList>

          <TabsContent value="cores" className="space-y-4">
            <TokenField label="Fundo" tokenKey="colorBackground" value={theme.colorBackground ?? ""} onChange={(v) => setToken("colorBackground", v)} hint="Ex: oklch(0.98 0 0) ou #f8f8f8" />
            <TokenField label="Superfície (cards, painéis)" tokenKey="colorSurface" value={theme.colorSurface ?? ""} onChange={(v) => setToken("colorSurface", v)} />
            <TokenField label="Texto principal" tokenKey="colorTextPrimary" value={theme.colorTextPrimary ?? ""} onChange={(v) => setToken("colorTextPrimary", v)} />
            <TokenField label="Texto secundário" tokenKey="colorTextSecondary" value={theme.colorTextSecondary ?? ""} onChange={(v) => setToken("colorTextSecondary", v)} />
            <TokenField label="Cor primária (botões, links)" tokenKey="colorPrimary" value={theme.colorPrimary ?? ""} onChange={(v) => setToken("colorPrimary", v)} />
            <TokenField label="Cor de destaque (accent)" tokenKey="colorAccent" value={theme.colorAccent ?? ""} onChange={(v) => setToken("colorAccent", v)} />
            <TokenField label="Bordas" tokenKey="colorBorder" value={theme.colorBorder ?? ""} onChange={(v) => setToken("colorBorder", v)} />
            <TokenField label="Foco (acessibilidade)" tokenKey="colorFocus" value={theme.colorFocus ?? ""} onChange={(v) => setToken("colorFocus", v)} hint="Mantenha contraste suficiente para WCAG AA" />
          </TabsContent>

          <TabsContent value="tipografia" className="space-y-4">
            <TokenField label="Fonte de títulos" tokenKey="fontHeading" value={theme.fontHeading ?? ""} onChange={(v) => setToken("fontHeading", v)} hint="Nome exato da fonte (ex: DM Serif Display, Playfair Display)" />
            <TokenField label="Fonte de corpo" tokenKey="fontBody" value={theme.fontBody ?? ""} onChange={(v) => setToken("fontBody", v)} hint="Nome exato da fonte (ex: Inter, Roboto)" />
            <TokenField label="Tamanho base" tokenKey="fontSizeBase" value={theme.fontSizeBase ?? ""} onChange={(v) => setToken("fontSizeBase", v)} hint="Ex: 1rem ou 16px" />
            <TokenField label="Altura de linha" tokenKey="lineHeightBase" value={theme.lineHeightBase ?? ""} onChange={(v) => setToken("lineHeightBase", v)} hint="Ex: 1.6" />
            <TokenField label="Espaçamento de letras (títulos)" tokenKey="letterSpacingHeading" value={theme.letterSpacingHeading ?? ""} onChange={(v) => setToken("letterSpacingHeading", v)} hint="Ex: -0.02em" />
          </TabsContent>

          <TabsContent value="forma" className="space-y-4">
            <TokenField label="Border radius — nenhum" tokenKey="radiusNone" value={theme.radiusNone ?? ""} onChange={(v) => setToken("radiusNone", v)} />
            <TokenField label="Border radius — pequeno" tokenKey="radiusSm" value={theme.radiusSm ?? ""} onChange={(v) => setToken("radiusSm", v)} />
            <TokenField label="Border radius — médio" tokenKey="radiusMd" value={theme.radiusMd ?? ""} onChange={(v) => setToken("radiusMd", v)} />
            <TokenField label="Border radius — grande" tokenKey="radiusLg" value={theme.radiusLg ?? ""} onChange={(v) => setToken("radiusLg", v)} />
            <TokenField label="Border radius — completo" tokenKey="radiusFull" value={theme.radiusFull ?? ""} onChange={(v) => setToken("radiusFull", v)} />
            <TokenField label="Sombra pequena" tokenKey="shadowSm" value={theme.shadowSm ?? ""} onChange={(v) => setToken("shadowSm", v)} />
            <TokenField label="Sombra média" tokenKey="shadowMd" value={theme.shadowMd ?? ""} onChange={(v) => setToken("shadowMd", v)} />
            <TokenField label="Sombra grande" tokenKey="shadowLg" value={theme.shadowLg ?? ""} onChange={(v) => setToken("shadowLg", v)} />
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <TokenField label="Largura máxima do conteúdo" tokenKey="maxWidth" value={theme.maxWidth ?? ""} onChange={(v) => setToken("maxWidth", v)} hint="Ex: 72rem ou 1152px" />
            <TokenField label="Gap base (espaçamento entre elementos)" tokenKey="gapBase" value={theme.gapBase ?? ""} onChange={(v) => setToken("gapBase", v)} hint="Ex: 1.5rem" />
          </TabsContent>

          <TabsContent value="movimento" className="space-y-4">
            <TokenField label="Duração rápida" tokenKey="motionFast" value={theme.motionFast ?? ""} onChange={(v) => setToken("motionFast", v)} hint="Ex: 120ms" />
            <TokenField label="Duração normal" tokenKey="motionNormal" value={theme.motionNormal ?? ""} onChange={(v) => setToken("motionNormal", v)} hint="Ex: 220ms" />
            <TokenField label="Duração lenta" tokenKey="motionSlow" value={theme.motionSlow ?? ""} onChange={(v) => setToken("motionSlow", v)} hint="Ex: 400ms" />
            <TokenField label="Easing" tokenKey="motionEasing" value={theme.motionEasing ?? ""} onChange={(v) => setToken("motionEasing", v)} hint="Ex: cubic-bezier(0.23, 1, 0.32, 1)" />
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              O sistema respeita automaticamente <code>prefers-reduced-motion</code>.
            </p>
          </TabsContent>

          <TabsContent value="linguagem" className="space-y-4">
            <TokenField label="Rótulo do CTA de projeto" tokenKey="ctaViewProject" value={theme.ctaViewProject ?? ""} onChange={(v) => setToken("ctaViewProject", v)} hint='Ex: "Ver projeto", "Explorar", "Descobrir"' />
            <TokenField label="Rótulo do botão de contato" tokenKey="ctaSendMessage" value={theme.ctaSendMessage ?? ""} onChange={(v) => setToken("ctaSendMessage", v)} hint='Ex: "Enviar pelo WhatsApp", "Falar comigo"' />
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 mt-8">
          <Button variant="outline" onClick={applyPreview}>
            {previewing ? "Atualizar preview" : "Preview"}
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending} style={{ background: "var(--color-primary)", color: "oklch(0.98 0 0)" }}>
            {updateMutation.isPending ? <><Loader2 className="animate-spin mr-2" size={16} />Salvando...</> : "Salvar aparência"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
