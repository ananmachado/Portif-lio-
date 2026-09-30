import React, { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Moon, Sun } from "lucide-react";
import type { ThemeConfig } from "../../../../drizzle/schema";

const LIGHT_COLORS: Required<Pick<ThemeConfig,
  "lightColorBackground" | "lightColorSurface" | "lightColorTextPrimary" | "lightColorTextSecondary" |
  "lightColorPrimary" | "lightColorSecondary" | "lightColorAccent" | "lightColorBorder" | "lightColorFocus">> = {
  lightColorBackground: "#FAF8FC",
  lightColorSurface: "#FFFFFF",
  lightColorTextPrimary: "#211A29",
  lightColorTextSecondary: "#5F5668",
  lightColorPrimary: "#6D28D9",
  lightColorSecondary: "#5B21B6",
  lightColorAccent: "#7C3AED",
  lightColorBorder: "#DDD5E5",
  lightColorFocus: "#5B21B6",
};

const DARK_COLORS: Required<Pick<ThemeConfig,
  "darkColorBackground" | "darkColorSurface" | "darkColorTextPrimary" | "darkColorTextSecondary" |
  "darkColorPrimary" | "darkColorSecondary" | "darkColorAccent" | "darkColorBorder" | "darkColorFocus">> = {
  darkColorBackground: "#0B0910",
  darkColorSurface: "#17131F",
  darkColorTextPrimary: "#F7F3FA",
  darkColorTextSecondary: "#C4BBCF",
  darkColorPrimary: "#7C3AED",
  darkColorSecondary: "#5B21B6",
  darkColorAccent: "#A855F7",
  darkColorBorder: "#332B3D",
  darkColorFocus: "#D8B4FE",
};

const SHARED_DEFAULTS: ThemeConfig = {
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
  shadowSm: "0 2px 0 rgb(46 25 63 / 9%)",
  shadowMd: "0 7px 0 rgb(46 25 63 / 10%)",
  shadowLg: "0 16px 0 rgb(46 25 63 / 10%)",
  maxWidth: "76rem",
  gapBase: "1.5rem",
  motionFast: "120ms",
  motionNormal: "220ms",
  motionSlow: "400ms",
  motionEasing: "cubic-bezier(0.23, 1, 0.32, 1)",
  ctaViewProject: "Ver projeto",
  ctaSendMessage: "Enviar pelo WhatsApp",
};

function TokenField({ idKey, label, value, onChange, hint }: { idKey: string; label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  const id = `appearance-${idKey}`;
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      {hint && <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>{hint}</p>}
      <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} className="font-mono text-sm" />
    </div>
  );
}

function ContrastCard({ foreground, background, label }: { foreground: string; background: string; label: string }) {
  return (
    <div className="rounded-lg border p-4" style={{ borderColor: "var(--color-border)" }}>
      <p className="text-xs mb-2" style={{ color: "var(--color-text-secondary)" }}>{label}</p>
      <div className="rounded-md p-4" style={{ background, color: foreground, border: `1px solid ${foreground}` }}>Texto de exemplo</div>
    </div>
  );
}

export default function AdminAppearance() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      toast.success("Aparência salva e aplicada!");
      utils.settings.get.invalidate();
      utils.settings.getPublic.invalidate();
    },
    onError: (e) => toast.error(`Erro: ${e.message}`),
  });

  const [theme, setTheme] = useState<ThemeConfig>({ ...SHARED_DEFAULTS, ...LIGHT_COLORS, ...DARK_COLORS });
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const incoming = (settings?.themeConfig as ThemeConfig | undefined) ?? {};
    setTheme({
      ...SHARED_DEFAULTS,
      ...LIGHT_COLORS,
      ...DARK_COLORS,
      ...incoming,
      // Migrate the previous single-theme palette into both modes only when
      // the new per-mode keys have never been saved.
      lightColorBackground: incoming.lightColorBackground ?? incoming.colorBackground ?? LIGHT_COLORS.lightColorBackground,
      lightColorSurface: incoming.lightColorSurface ?? incoming.colorSurface ?? LIGHT_COLORS.lightColorSurface,
      lightColorTextPrimary: incoming.lightColorTextPrimary ?? incoming.colorTextPrimary ?? LIGHT_COLORS.lightColorTextPrimary,
      lightColorTextSecondary: incoming.lightColorTextSecondary ?? incoming.colorTextSecondary ?? LIGHT_COLORS.lightColorTextSecondary,
      lightColorPrimary: incoming.lightColorPrimary ?? incoming.colorPrimary ?? LIGHT_COLORS.lightColorPrimary,
      lightColorSecondary: incoming.lightColorSecondary ?? incoming.colorSecondary ?? LIGHT_COLORS.lightColorSecondary,
      lightColorAccent: incoming.lightColorAccent ?? incoming.colorAccent ?? LIGHT_COLORS.lightColorAccent,
      lightColorBorder: incoming.lightColorBorder ?? incoming.colorBorder ?? LIGHT_COLORS.lightColorBorder,
      lightColorFocus: incoming.lightColorFocus ?? incoming.colorFocus ?? LIGHT_COLORS.lightColorFocus,
    });
  }, [settings]);

  const fields = useMemo(() => mode === "light"
    ? [
        ["Fundo", "lightColorBackground"],
        ["Superfície (cards, painéis)", "lightColorSurface"],
        ["Texto principal", "lightColorTextPrimary"],
        ["Texto secundário", "lightColorTextSecondary"],
        ["Cor primária (botões, links)", "lightColorPrimary"],
        ["Cor secundária", "lightColorSecondary"],
        ["Cor de destaque (accent)", "lightColorAccent"],
        ["Bordas", "lightColorBorder"],
        ["Foco (acessibilidade)", "lightColorFocus"],
      ] as const
    : [
        ["Fundo", "darkColorBackground"],
        ["Superfície (cards, painéis)", "darkColorSurface"],
        ["Texto principal", "darkColorTextPrimary"],
        ["Texto secundário", "darkColorTextSecondary"],
        ["Cor primária (botões, links)", "darkColorPrimary"],
        ["Cor secundária", "darkColorSecondary"],
        ["Cor de destaque (accent)", "darkColorAccent"],
        ["Bordas", "darkColorBorder"],
        ["Foco (acessibilidade)", "darkColorFocus"],
      ] as const, [mode]);

  function setToken(key: keyof ThemeConfig, value: string) {
    setTheme((prev) => ({ ...prev, [key]: value }));
  }

  function applyModePreview() {
    const root = document.documentElement;
    const selected = mode === "light"
      ? {
          "--color-background": theme.lightColorBackground,
          "--color-surface": theme.lightColorSurface,
          "--color-text-primary": theme.lightColorTextPrimary,
          "--color-text-secondary": theme.lightColorTextSecondary,
          "--color-primary": theme.lightColorPrimary,
          "--color-secondary": theme.lightColorSecondary,
          "--color-accent": theme.lightColorAccent,
          "--color-border": theme.lightColorBorder,
          "--color-focus": theme.lightColorFocus,
        }
      : {
          "--color-background": theme.darkColorBackground,
          "--color-surface": theme.darkColorSurface,
          "--color-text-primary": theme.darkColorTextPrimary,
          "--color-text-secondary": theme.darkColorTextSecondary,
          "--color-primary": theme.darkColorPrimary,
          "--color-secondary": theme.darkColorSecondary,
          "--color-accent": theme.darkColorAccent,
          "--color-border": theme.darkColorBorder,
          "--color-focus": theme.darkColorFocus,
        };
    root.classList.toggle("dark", mode === "dark");
    Object.entries(selected).forEach(([prop, value]) => { if (value) root.style.setProperty(prop, value); });
    toast.info(`Preview do modo ${mode === "light" ? "claro" : "noturno"} aplicado. Clique em salvar para persistir.`);
  }

  function handleSave() {
    // Keep legacy fields synced to the light theme so older components/data stay compatible.
    const payload: Record<string, string> = { ...theme as Record<string, string> };
    payload.colorBackground = theme.lightColorBackground ?? "";
    payload.colorSurface = theme.lightColorSurface ?? "";
    payload.colorTextPrimary = theme.lightColorTextPrimary ?? "";
    payload.colorTextSecondary = theme.lightColorTextSecondary ?? "";
    payload.colorPrimary = theme.lightColorPrimary ?? "";
    payload.colorSecondary = theme.lightColorSecondary ?? "";
    payload.colorAccent = theme.lightColorAccent ?? "";
    payload.colorBorder = theme.lightColorBorder ?? "";
    payload.colorFocus = theme.lightColorFocus ?? "";
    updateMutation.mutate({ themeConfig: payload });
  }

  if (isLoading) return <AdminLayout title="Aparência"><Loader2 className="animate-spin" /></AdminLayout>;

  const selectedBackground = mode === "light" ? theme.lightColorBackground! : theme.darkColorBackground!;
  const selectedText = mode === "light" ? theme.lightColorTextPrimary! : theme.darkColorTextPrimary!;

  return (
    <AdminLayout title="Aparência">
      <div className="space-y-8 max-w-5xl">
        <div>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Configure os dois modos do portfólio separadamente. O visitante pode alternar entre eles pelo botão no cabeçalho.</p>
        </div>

        <Tabs value={mode} onValueChange={(value) => setMode(value as "light" | "dark")}>
          <TabsList aria-label="Escolha o modo que deseja editar">
            <TabsTrigger value="light"><Sun size={16} className="mr-2" aria-hidden="true" />Modo claro</TabsTrigger>
            <TabsTrigger value="dark"><Moon size={16} className="mr-2" aria-hidden="true" />Modo noturno</TabsTrigger>
          </TabsList>

          <TabsContent value="light" className="space-y-4 mt-6">
            {fields.map(([label, key]) => (
              <TokenField key={key} idKey={key} label={label} value={(theme[key] as string) ?? ""} onChange={(v) => setToken(key, v)} hint={key.endsWith("Focus") ? "Use uma cor claramente visível em torno dos controles." : undefined} />
            ))}
          </TabsContent>

          <TabsContent value="dark" className="space-y-4 mt-6">
            {fields.map(([label, key]) => (
              <TokenField key={key} idKey={key} label={label} value={(theme[key] as string) ?? ""} onChange={(v) => setToken(key, v)} hint={key.endsWith("Focus") ? "Use uma cor claramente visível em torno dos controles." : undefined} />
            ))}
          </TabsContent>
        </Tabs>

        <div className="grid gap-4 md:grid-cols-2">
          <ContrastCard label="Texto principal sobre o fundo" foreground={selectedText} background={selectedBackground} />
          <ContrastCard label="Texto secundário sobre a superfície" foreground={mode === "light" ? theme.lightColorTextSecondary! : theme.darkColorTextSecondary!} background={mode === "light" ? theme.lightColorSurface! : theme.darkColorSurface!} />
        </div>

        <Tabs defaultValue="tipografia">
          <TabsList aria-label="Configurações visuais compartilhadas">
            <TabsTrigger value="tipografia">Tipografia</TabsTrigger>
            <TabsTrigger value="forma">Forma</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="movimento">Movimento</TabsTrigger>
            <TabsTrigger value="linguagem">Linguagem</TabsTrigger>
          </TabsList>

          <TabsContent value="tipografia" className="space-y-4 mt-6">
            <TokenField idKey="fontHeading" label="Fonte de títulos" value={theme.fontHeading ?? ""} onChange={(v) => setToken("fontHeading", v)} />
            <TokenField idKey="fontBody" label="Fonte de corpo" value={theme.fontBody ?? ""} onChange={(v) => setToken("fontBody", v)} />
            <TokenField idKey="fontSizeBase" label="Tamanho base" value={theme.fontSizeBase ?? ""} onChange={(v) => setToken("fontSizeBase", v)} />
            <TokenField idKey="lineHeightBase" label="Altura de linha" value={theme.lineHeightBase ?? ""} onChange={(v) => setToken("lineHeightBase", v)} />
            <TokenField idKey="letterSpacingHeading" label="Espaçamento de letras (títulos)" value={theme.letterSpacingHeading ?? ""} onChange={(v) => setToken("letterSpacingHeading", v)} />
          </TabsContent>

          <TabsContent value="forma" className="space-y-4 mt-6">
            <TokenField idKey="radiusNone" label="Border radius — nenhum" value={theme.radiusNone ?? ""} onChange={(v) => setToken("radiusNone", v)} />
            <TokenField idKey="radiusSm" label="Border radius — pequeno" value={theme.radiusSm ?? ""} onChange={(v) => setToken("radiusSm", v)} />
            <TokenField idKey="radiusMd" label="Border radius — médio" value={theme.radiusMd ?? ""} onChange={(v) => setToken("radiusMd", v)} />
            <TokenField idKey="radiusLg" label="Border radius — grande" value={theme.radiusLg ?? ""} onChange={(v) => setToken("radiusLg", v)} />
            <TokenField idKey="radiusFull" label="Border radius — completo" value={theme.radiusFull ?? ""} onChange={(v) => setToken("radiusFull", v)} />
            <TokenField idKey="shadowSm" label="Sombra pequena" value={theme.shadowSm ?? ""} onChange={(v) => setToken("shadowSm", v)} />
            <TokenField idKey="shadowMd" label="Sombra média" value={theme.shadowMd ?? ""} onChange={(v) => setToken("shadowMd", v)} />
            <TokenField idKey="shadowLg" label="Sombra grande" value={theme.shadowLg ?? ""} onChange={(v) => setToken("shadowLg", v)} />
          </TabsContent>

          <TabsContent value="layout" className="space-y-4 mt-6">
            <TokenField idKey="maxWidth" label="Largura máxima do conteúdo" value={theme.maxWidth ?? ""} onChange={(v) => setToken("maxWidth", v)} />
            <TokenField idKey="gapBase" label="Gap base (espaçamento entre elementos)" value={theme.gapBase ?? ""} onChange={(v) => setToken("gapBase", v)} />
          </TabsContent>

          <TabsContent value="movimento" className="space-y-4 mt-6">
            <TokenField idKey="motionFast" label="Duração rápida" value={theme.motionFast ?? ""} onChange={(v) => setToken("motionFast", v)} />
            <TokenField idKey="motionNormal" label="Duração normal" value={theme.motionNormal ?? ""} onChange={(v) => setToken("motionNormal", v)} />
            <TokenField idKey="motionSlow" label="Duração lenta" value={theme.motionSlow ?? ""} onChange={(v) => setToken("motionSlow", v)} />
            <TokenField idKey="motionEasing" label="Easing" value={theme.motionEasing ?? ""} onChange={(v) => setToken("motionEasing", v)} />
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>O sistema respeita <code>prefers-reduced-motion</code>.</p>
          </TabsContent>

          <TabsContent value="linguagem" className="space-y-4 mt-6">
            <TokenField idKey="ctaViewProject" label="Rótulo do CTA de projeto" value={theme.ctaViewProject ?? ""} onChange={(v) => setToken("ctaViewProject", v)} />
            <TokenField idKey="ctaSendMessage" label="Rótulo do botão de contato" value={theme.ctaSendMessage ?? ""} onChange={(v) => setToken("ctaSendMessage", v)} />
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap gap-3 pt-2">
          <Button variant="outline" onClick={applyModePreview}>Preview do modo {mode === "light" ? "claro" : "noturno"}</Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending} style={{ background: "var(--color-primary)", color: "#FFFFFF" }}>
            {updateMutation.isPending ? <><Loader2 className="animate-spin mr-2" size={16} />Salvando...</> : "Salvar aparência"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
